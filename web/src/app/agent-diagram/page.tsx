import { getCurrentUser } from '@/lib/session';

interface DiagramData {
  mermaid: string;
  nodes: Array<{ id: string; label: string }>;
}

async function getDiagramData(): Promise<DiagramData> {
  try {
    const res = await fetch('http://localhost:4000/api/agent/diagram', {
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // fallback if api server offline
  }
  return {
    mermaid: `
flowchart TD
  START([User Query]) --> input_guard[Input Guard: PII Masking & Injection Check]
  input_guard -->|Injection / Off-topic| log[Trace Logger & Observability]
  input_guard -->|Distress Detected| distress[Distress Handler: Wellbeing Referral]
  input_guard -->|Safe Aid Query| router[Router: Intent Classifier]
  distress --> log
  router -->|Pure FAQ / Deadlines| faq[Rule Engine: No LLM / 0 Tokens]
  router -->|Policy & Aid Query| retrieve[Hybrid Retriever: Vector + BM25 + ACL]
  faq --> log
  retrieve -->|Low Confidence| not_found[Not Found Fallback + Office Contact]
  not_found --> log
  retrieve -->|High Confidence Chunks| reason[Reason & Draft: LLM Generation]
  reason --> output_guard[Output Guard: Grounding & No-Commitment]
  output_guard --> log
  log --> END([Final Answer & Trace Saved])
    `.trim(),
    nodes: [
      { id: 'input_guard', label: 'Input Guard: PII regex masking & injection detection' },
      { id: 'distress_handler', label: 'Distress Handler: Counselling Cell hand-off' },
      { id: 'router', label: 'Intent Router: FAQ short-circuit (0 tokens)' },
      { id: 'retrieve', label: 'Hybrid Retriever: Vector + BM25 + ACL enforcement' },
      { id: 'reason_draft', label: 'Reason & Draft: LLM synthesis with citations' },
      { id: 'output_guard', label: 'Output Guard: Grounding & commitment prohibition' },
      { id: 'log', label: 'Trace Logger: Observability into SQLite traces' },
    ],
  };
}

export default async function AgentDiagramPage() {
  const data = await getDiagramData();

  return (
    <div>
      <a href="/" className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to Home
      </a>

      <h1 className="govuk-heading-xl">Agent Workflow & State Architecture</h1>
      <p className="govuk-body-lead">
        Visual representation of the explicit LangGraph.js execution graph, state transitions,
        guardrail interceptors, and human-in-the-loop decision boundaries.
      </p>

      {/* Mermaid Graph Code Block & Visual Structure */}
      <h2 className="govuk-heading-l">State Transition Flowchart</h2>
      <div
        style={{
          border: '2px solid #0b0c0c',
          backgroundColor: '#f3f2f1',
          padding: '1.5rem',
          marginBottom: '2rem',
          fontFamily: 'monospace',
          fontSize: '15px',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto',
        }}
      >
        {data.mermaid}
      </div>

      <h2 className="govuk-heading-l">State Node Specifications & Defensible Decisions</h2>
      <table className="govuk-summary-list">
        <tbody>
          {data.nodes.map((node) => (
            <tr key={node.id} className="govuk-summary-list__row">
              <th className="govuk-summary-list__key" style={{ width: '25%' }}>
                <code>{node.id}</code>
              </th>
              <td className="govuk-summary-list__value">{node.label}</td>
              <td className="govuk-summary-list__actions">
                <span className="govuk-tag govuk-tag--green">ACTIVE</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Defensible Design Notes */}
      <h2 className="govuk-heading-l">Defensible Architecture Highlights</h2>
      <div className="govuk-grid-row">
        <div className="govuk-card">
          <h3 className="govuk-heading-m" style={{ marginTop: 0 }}>Zero-Token FAQ Short-Circuit</h3>
          <p className="govuk-body">
            Deterministic calendar deadlines and official office contacts bypass LLM generation entirely, eliminating token costs and preventing hallucination on factual administrative data.
          </p>
        </div>
        <div className="govuk-card">
          <h3 className="govuk-heading-m" style={{ marginTop: 0 }}>Emergency Distress Bypasses</h3>
          <p className="govuk-body">
            Suicide or extreme hardship expressions immediately short-circuit to a dedicated Counselling Cell referral docket with zero LLM generation delay.
          </p>
        </div>
        <div className="govuk-card">
          <h3 className="govuk-heading-m" style={{ marginTop: 0 }}>Human Approval Gate</h3>
          <p className="govuk-body">
            All disbursement notes and notifications are held in a pending state with unique idempotency keys. The agent is strictly prohibited from approving, rejecting, or disbursing.
          </p>
        </div>
      </div>
    </div>
  );
}
