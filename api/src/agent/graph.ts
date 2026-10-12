import crypto from 'node:crypto';
import { StateGraph, Annotation, END, START } from '@langchain/langgraph';
import { runInputGuards } from '../guardrails/inputGuard.js';
import { runOutputGuards } from '../guardrails/outputGuard.js';
import { retrieveRelevantChunks, RetrievedChunk } from '../rag/retriever.js';
import { callLLM } from '../llm/client.js';
import { executeTool } from '../tools/index.js';
import { saveTrace } from '../tracing/logger.js';
import { getHardeningConfig, brandConfig } from '../config.js';

// Define explicit State Annotation for LangGraph.js
export const AgentState = Annotation.Root({
  runId: Annotation<string>(),
  sessionId: Annotation<string>(),
  rawInput: Annotation<string>(),
  maskedInput: Annotation<string>(),
  userRole: Annotation<'student' | 'staff' | 'committee' | 'admin'>(),
  studentId: Annotation<string | undefined>(),
  route: Annotation<string>(),
  retrievedChunks: Annotation<RetrievedChunk[]>({
    reducer: (curr, next) => next || curr,
    default: () => [],
  }),
  guardsFired: Annotation<string[]>({
    reducer: (curr, next) => Array.from(new Set([...curr, ...(next || [])])),
    default: () => [],
  }),
  toolCalls: Annotation<any[]>({
    reducer: (curr, next) => [...curr, ...(next || [])],
    default: () => [],
  }),
  draftOutput: Annotation<string>(),
  finalOutput: Annotation<string>(),
  actionProposals: Annotation<any[]>({
    reducer: (curr, next) => [...curr, ...(next || [])],
    default: () => [],
  }),
  tokensIn: Annotation<number>({
    reducer: (curr, next) => curr + (next || 0),
    default: () => 0,
  }),
  tokensOut: Annotation<number>({
    reducer: (curr, next) => curr + (next || 0),
    default: () => 0,
  }),
  inrCost: Annotation<number>({
    reducer: (curr, next) => curr + (next || 0),
    default: () => 0,
  }),
  latencyBreakdown: Annotation<Record<string, number>>({
    reducer: (curr, next) => ({ ...curr, ...(next || {}) }),
    default: () => ({}),
  }),
  stepCount: Annotation<number>({
    reducer: (curr, next) => (next !== undefined ? next : curr + 1),
    default: () => 0,
  }),
  status: Annotation<'success' | 'refused' | 'error' | 'pending_approval'>(),
  failureId: Annotation<string | undefined>(),
});

export type AgentStateType = typeof AgentState.State;

// 1. Node: input_guard
async function inputGuardNode(state: AgentStateType) {
  const start = Date.now();
  const inputCheck = runInputGuards(state.rawInput);
  const latency = Date.now() - start;

  if (inputCheck.isInjection) {
    return {
      maskedInput: inputCheck.maskedInput,
      route: 'injection_blocked',
      guardsFired: inputCheck.guardsFired,
      finalOutput: inputCheck.refusalMessage || 'Security Alert: Prompt injection attempt blocked.',
      status: 'refused' as const,
      failureId: 'F2',
      latencyBreakdown: { input_guard: latency },
      stepCount: state.stepCount + 1,
    };
  }

  if (inputCheck.isOffTopic) {
    return {
      maskedInput: inputCheck.maskedInput,
      route: 'off_topic_refusal',
      guardsFired: inputCheck.guardsFired,
      finalOutput: inputCheck.refusalMessage || 'This query is out of scope for financial aid.',
      status: 'refused' as const,
      failureId: 'F9',
      latencyBreakdown: { input_guard: latency },
      stepCount: state.stepCount + 1,
    };
  }

  if (inputCheck.isDistress) {
    return {
      maskedInput: inputCheck.maskedInput,
      route: 'distress',
      guardsFired: inputCheck.guardsFired,
      latencyBreakdown: { input_guard: latency },
      stepCount: state.stepCount + 1,
    };
  }

  return {
    maskedInput: inputCheck.maskedInput,
    route: 'router',
    guardsFired: inputCheck.guardsFired,
    latencyBreakdown: { input_guard: latency },
    stepCount: state.stepCount + 1,
  };
}

// 2. Node: distress_handler (Immediate crisis handoff)
async function distressHandlerNode(state: AgentStateType) {
  const counselling = brandConfig.offices.counselling;
  const aidOffice = brandConfig.offices.aid_committee;

  const distressMessage = `
We understand you are experiencing distress. Please know you are not alone, and immediate assistance is available:

1. **Student Wellbeing & Counselling Cell**:
   - Location: ${counselling?.location || 'Health & Wellbeing Centre'}
   - Email: ${counselling?.email || 'wellbeing@example.ac.in'}
   - Phone: ${counselling?.phone || '+91-631-2200238'}

2. **Emergency Hardship Assistance**:
   - For sudden family bereavement, financial destitution, or urgent medical emergencies, apply under the **Emergency Student Hardship & Bereavement Fund** (§4.2).
   - Contact: ${aidOffice?.email || 'aid-committee@example.ac.in'}

Your message has been treated with confidentiality and prioritized.
  `.trim();

  return {
    finalOutput: distressMessage,
    status: 'success' as const,
    failureId: 'F8',
    stepCount: state.stepCount + 1,
  };
}

// 3. Node: router (Classifies & short-circuits pure FAQs)
async function routerNode(state: AgentStateType) {
  const query = state.maskedInput.toLowerCase();

  // Pure FAQ short-circuit check (zero LLM token consumption)
  if (query.includes('deadline') || query.includes('last date')) {
    const deadlinesList = brandConfig.calendar.deadlines
      .map((d) => `- **${d.scheme}**: ${d.deadline_date} (${d.description})`)
      .join('\n');
    return {
      route: 'faq_rule_engine',
      finalOutput: `Official application deadlines for academic year ${brandConfig.calendar.academic_year}:\n\n${deadlinesList}\n\nCitation: "Circular Oct-2026 Revision, §2.0, 2026-27"`,
      status: 'success' as const,
      stepCount: state.stepCount + 1,
    };
  }

  if (query.includes('contact') || query.includes('phone') || query.includes('email') || query.includes('where is the office')) {
    return {
      route: 'faq_rule_engine',
      finalOutput: `Official Financial Aid Contact Offices:\n- **Accounts Office:** ${brandConfig.offices.accounts?.email} (${brandConfig.offices.accounts?.phone})\n- **Aid Committee:** ${brandConfig.offices.aid_committee?.email}\n- **Counselling Cell:** ${brandConfig.offices.counselling?.email}\n\nCitation: "Student Handbook, §6.1, 2026-27"`,
      status: 'success' as const,
      stepCount: state.stepCount + 1,
    };
  }

  return {
    route: 'retrieve',
    stepCount: state.stepCount + 1,
  };
}

// 4. Node: retrieve (ACL filtered by userRole)
async function retrieveNode(state: AgentStateType) {
  const start = Date.now();
  const res = await retrieveRelevantChunks(state.maskedInput, state.userRole, 4);
  const latency = Date.now() - start;

  if (res.isLowConfidence) {
    return {
      retrievedChunks: res.chunks,
      finalOutput: res.fallbackMessage || 'I could not find this in the current documents. Please contact the Accounts Office (accounts@example.ac.in).',
      status: 'success' as const,
      failureId: 'F13',
      latencyBreakdown: { retrieve: latency },
      stepCount: state.stepCount + 1,
    };
  }

  return {
    retrievedChunks: res.chunks,
    latencyBreakdown: { retrieve: latency },
    stepCount: state.stepCount + 1,
  };
}

// 5. Node: reason_draft (Synthesizes answer with citations)
async function reasonDraftNode(state: AgentStateType) {
  const start = Date.now();
  const contextText = state.retrievedChunks.map((c, i) => `[Source ${i + 1} (${c.citation})]:\n${c.content}`).join('\n\n');

  const systemPrompt = `You are "Sahayata", an official financial aid advisor at IIM Bodh Gaya.
Provide accurate, empathetic, and clear guidance using ONLY the provided official policy sources.
Always cite your sources in the format: "Document Name, §section, version".
NEVER guarantee or promise that aid or waiver will be approved; explicitly state that awards require Aid Committee review.
If information is not in the source text, state clearly that it is not found and refer the student to the Accounts Office.`;

  const userPrompt = `Student Role: ${state.userRole}\nStudent ID: ${state.studentId || 'Anonymous'}\n\nContext Policies:\n${contextText}\n\nQuery:\n${state.maskedInput}`;

  const llmRes = await callLLM({
    prompt: userPrompt,
    systemPrompt,
  });

  const latency = Date.now() - start;
  return {
    draftOutput: llmRes.text,
    tokensIn: llmRes.promptTokens,
    tokensOut: llmRes.completionTokens,
    inrCost: llmRes.costInr,
    latencyBreakdown: { reason_draft: latency },
    stepCount: state.stepCount + 1,
  };
}

// 6. Node: output_guard (Grounding, no-commitment, tone)
async function outputGuardNode(state: AgentStateType) {
  const start = Date.now();
  const guarded = runOutputGuards(state.draftOutput || '', state.retrievedChunks);
  const latency = Date.now() - start;

  return {
    finalOutput: guarded.guardedOutput,
    guardsFired: guarded.guardsFired,
    latencyBreakdown: { output_guard: latency },
    status: 'success' as const,
    stepCount: state.stepCount + 1,
  };
}

// 7. Node: log (Persists full trace to SQLite)
async function logNode(state: AgentStateType) {
  const totalLatency = Object.values(state.latencyBreakdown).reduce((a, b) => a + b, 0);

  saveTrace({
    runId: state.runId,
    sessionId: state.sessionId,
    role: state.userRole,
    userId: state.studentId,
    rawInput: state.rawInput,
    maskedInput: state.maskedInput,
    route: state.route,
    retrievedChunks: state.retrievedChunks,
    prompts: [{ input: state.maskedInput }],
    output: state.finalOutput || state.draftOutput || '',
    guardsFired: state.guardsFired,
    toolCalls: state.toolCalls,
    promptTokens: state.tokensIn,
    completionTokens: state.tokensOut,
    latencyMs: totalLatency,
    latencyBreakdown: state.latencyBreakdown,
    inrCost: state.inrCost,
    status: state.status || 'success',
    failureId: state.failureId,
  });

  return state;
}

// Build LangGraph.js State Graph
export function buildAgentGraph() {
  const workflow = new StateGraph(AgentState)
    .addNode('input_guard', inputGuardNode)
    .addNode('distress_handler', distressHandlerNode)
    .addNode('router', routerNode)
    .addNode('retrieve', retrieveNode)
    .addNode('reason_draft', reasonDraftNode)
    .addNode('output_guard', outputGuardNode)
    .addNode('log', logNode);

  // Define graph connections
  workflow.addEdge(START, 'input_guard');

  workflow.addConditionalEdges('input_guard', (state) => {
    if (state.route === 'injection_blocked' || state.route === 'off_topic_refusal') {
      return 'log';
    }
    if (state.route === 'distress') {
      return 'distress_handler';
    }
    return 'router';
  });

  workflow.addEdge('distress_handler', 'log');

  workflow.addConditionalEdges('router', (state) => {
    if (state.route === 'faq_rule_engine') {
      return 'log';
    }
    return 'retrieve';
  });

  workflow.addConditionalEdges('retrieve', (state) => {
    if (state.finalOutput) {
      // Short-circuited by low-confidence threshold guard
      return 'log';
    }
    return 'reason_draft';
  });

  workflow.addEdge('reason_draft', 'output_guard');
  workflow.addEdge('output_guard', 'log');
  workflow.addEdge('log', END);

  return workflow.compile();
}

// Main execution entry point for agent
export async function runAgent(params: {
  input: string;
  userRole?: 'student' | 'staff' | 'committee' | 'admin';
  studentId?: string;
  sessionId?: string;
}): Promise<AgentStateType> {
  const app = buildAgentGraph();
  const runId = `run_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const initialState = {
    runId,
    sessionId: params.sessionId || 'session_default',
    rawInput: params.input,
    maskedInput: params.input,
    userRole: params.userRole || 'student',
    studentId: params.studentId || 'std_01',
    route: 'start',
    retrievedChunks: [],
    guardsFired: [],
    toolCalls: [],
    draftOutput: '',
    finalOutput: '',
    actionProposals: [],
    tokensIn: 0,
    tokensOut: 0,
    inrCost: 0,
    latencyBreakdown: {},
    stepCount: 0,
    status: 'success' as const,
  };

  const finalState = await app.invoke(initialState);
  return finalState as AgentStateType;
}

// Mermaid diagram export
export function getAgentGraphMermaid(): string {
  return `
flowchart TD
  START([User Query]) --> input_guard[Input Guard: PII Masking & Injection Check]
  input_guard -->|Injection / Off-topic| log[Trace Logger & Observability]
  input_guard -->|Distress Detected| distress[Distress Handler: Wellbeing Referral]
  input_guard -->|Safe Aid Query| router[Router: Intent Classifier]
  
  distress --> log
  
  router -->|Pure FAQ / Deadlines| faq[Rule Engine: No LLM / 0 Tokens]
  router -->|Policy & Aid Query| retrieve[Hybrid Retriever: Vector + BM25 + ACL]
  
  faq --> log
  
  retrieve -->|Low Confidence < Threshold| not_found[Not Found Fallback + Office Contact]
  not_found --> log
  
  retrieve -->|High Confidence Chunks| reason[Reason & Draft: LLM Generation]
  reason --> output_guard[Output Guard: Grounding & No-Commitment]
  output_guard --> log
  
  log --> END([Final Answer & Trace Saved])
  `.trim();
}
