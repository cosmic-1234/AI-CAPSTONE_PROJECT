import { Router } from 'express';
import { z } from 'zod';
import { runAgent, getAgentGraphMermaid } from '../agent/graph.js';
import { executeTool, ALLOWED_TOOLS } from '../tools/index.js';

export const agentRouter = Router();

const chatSchema = z.object({
  message: z.string().min(1),
  role: z.enum(['student', 'staff', 'committee', 'admin']).default('student'),
  studentId: z.string().optional(),
  sessionId: z.string().optional(),
});

// Run agent
agentRouter.post('/chat', async (req, res) => {
  try {
    const parsed = chatSchema.parse(req.body);
    const result = await runAgent({
      input: parsed.message,
      userRole: parsed.role,
      studentId: parsed.studentId,
      sessionId: parsed.sessionId,
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Expose state diagram
agentRouter.get('/diagram', (req, res) => {
  res.json({
    mermaid: getAgentGraphMermaid(),
    nodes: [
      { id: 'input_guard', label: 'Input Guard (PII Masking & Injection Detection)' },
      { id: 'distress_handler', label: 'Distress Handler (Counselling Hand-Off)' },
      { id: 'router', label: 'Intent Router (FAQ Short-Circuit)' },
      { id: 'retrieve', label: 'Hybrid Retriever (ACL & Supersession Filter)' },
      { id: 'reason_draft', label: 'Reason & Draft (LLM Generation)' },
      { id: 'output_guard', label: 'Output Guard (Grounding & Commitment Prohibition)' },
      { id: 'log', label: 'Trace Logger & Observability' },
    ],
  });
});

// Execute tool directly
agentRouter.post('/tool', (req, res) => {
  const { tool, args } = req.body;
  if (!tool) {
    return res.status(400).json({ error: 'Tool name required' });
  }
  const result = executeTool(tool, args || {});
  res.json(result);
});

// List allowed tools
agentRouter.get('/tools', (req, res) => {
  res.json({ tools: ALLOWED_TOOLS });
});
