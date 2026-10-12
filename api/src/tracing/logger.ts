import crypto from 'node:crypto';
import { getDb } from '../db/index.js';

export interface TraceRecord {
  runId: string;
  sessionId?: string;
  timestamp?: string;
  role: string;
  userId?: string;
  rawInput: string;
  maskedInput: string;
  route: string;
  retrievedChunks: any[];
  prompts: any[];
  output: string;
  guardsFired: string[];
  toolCalls: any[];
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  latencyBreakdown?: Record<string, number>;
  inrCost: number;
  status: 'success' | 'refused' | 'error' | 'pending_approval';
  failureId?: string;
}

export function saveTrace(trace: TraceRecord): string {
  const db = getDb();
  const runId = trace.runId || `run_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const insert = db.prepare(`
    INSERT INTO traces (
      run_id, session_id, role, user_id, raw_input, masked_input, route,
      retrieved_chunks_json, prompts_json, output, guards_fired_json, tool_calls_json,
      prompt_tokens, completion_tokens, latency_ms, latency_breakdown_json,
      inr_cost, status, failure_id
    ) VALUES (
      @run_id, @session_id, @role, @user_id, @raw_input, @masked_input, @route,
      @retrieved_chunks_json, @prompts_json, @output, @guards_fired_json, @tool_calls_json,
      @prompt_tokens, @completion_tokens, @latency_ms, @latency_breakdown_json,
      @inr_cost, @status, @failure_id
    )
  `);

  insert.run({
    run_id: runId,
    session_id: trace.sessionId || null,
    role: trace.role,
    user_id: trace.userId || null,
    raw_input: trace.rawInput,
    masked_input: trace.maskedInput,
    route: trace.route,
    retrieved_chunks_json: JSON.stringify(trace.retrievedChunks || []),
    prompts_json: JSON.stringify(trace.prompts || []),
    output: trace.output,
    guards_fired_json: JSON.stringify(trace.guardsFired || []),
    tool_calls_json: JSON.stringify(trace.toolCalls || []),
    prompt_tokens: trace.promptTokens || 0,
    completion_tokens: trace.completionTokens || 0,
    latency_ms: trace.latencyMs || 0,
    latency_breakdown_json: JSON.stringify(trace.latencyBreakdown || {}),
    inr_cost: trace.inrCost || 0,
    status: trace.status,
    failure_id: trace.failureId || null,
  });

  return runId;
}

export function getTraces(filters?: {
  role?: string;
  guard?: string;
  failureId?: string;
  status?: string;
  limit?: number;
}): any[] {
  const db = getDb();
  let query = 'SELECT * FROM traces WHERE 1=1';
  const params: any[] = [];

  if (filters?.role) {
    query += ' AND role = ?';
    params.push(filters.role);
  }
  if (filters?.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters?.failureId) {
    query += ' AND failure_id = ?';
    params.push(filters.failureId);
  }
  if (filters?.guard) {
    query += ' AND guards_fired_json LIKE ?';
    params.push(`%"${filters.guard}"%`);
  }

  query += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(filters?.limit || 50);

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map((r) => ({
    ...r,
    retrieved_chunks: JSON.parse(r.retrieved_chunks_json || '[]'),
    guards_fired: JSON.parse(r.guards_fired_json || '[]'),
    tool_calls: JSON.parse(r.tool_calls_json || '[]'),
    latency_breakdown: JSON.parse(r.latency_breakdown_json || '{}'),
  }));
}

export function exportTracesAsCsv(): string {
  const traces = getTraces({ limit: 1000 });
  const headers = [
    'run_id',
    'timestamp',
    'role',
    'route',
    'status',
    'failure_id',
    'guards_fired',
    'prompt_tokens',
    'completion_tokens',
    'latency_ms',
    'inr_cost',
    'masked_input',
  ];

  const lines = [headers.join(',')];
  for (const t of traces) {
    const guards = (t.guards_fired || []).join(';');
    const inputEscaped = `"${(t.masked_input || '').replace(/"/g, '""')}"`;
    lines.push([
      t.run_id,
      t.timestamp,
      t.role,
      t.route,
      t.status,
      t.failure_id || '',
      `"${guards}"`,
      t.prompt_tokens,
      t.completion_tokens,
      t.latency_ms,
      t.inr_cost,
      inputEscaped,
    ].join(','));
  }
  return lines.join('\n');
}
