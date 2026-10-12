import { API_BASE_URL } from '@/lib/session';

interface TraceItem {
  run_id: string;
  timestamp: string;
  role: string;
  masked_input: string;
  route: string;
  status: string;
  failure_id: string | null;
  guards_fired: string[];
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  latency_breakdown: Record<string, number>;
  inr_cost: number;
  output: string;
  retrieved_chunks: Array<{
    title: string;
    section: string;
    citation: string;
    score: number;
  }>;
}

async function fetchTraces(filters: {
  role?: string;
  status?: string;
  guard?: string;
  failureId?: string;
}): Promise<TraceItem[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.role) queryParams.set('role', filters.role);
    if (filters.status) queryParams.set('status', filters.status);
    if (filters.guard) queryParams.set('guard', filters.guard);
    if (filters.failureId) queryParams.set('failureId', filters.failureId);
    queryParams.set('limit', '50');

    const res = await fetch(`${API_BASE_URL}/api/traces?${queryParams.toString()}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return data.traces || [];
    }
  } catch (err) {
    // API connection fallback
  }

  // Fallback seed traces
  return [
    {
      run_id: 'run_sample_01',
      timestamp: '2026-10-12 09:20:15',
      role: 'student',
      masked_input: 'My Aadhaar is [REDACTED-AADHAAR]. What are the income limits for NBFA?',
      route: 'reason_draft',
      status: 'success',
      failure_id: 'F3',
      guards_fired: ['pii_masking_guard'],
      prompt_tokens: 312,
      completion_tokens: 145,
      latency_ms: 680,
      latency_breakdown: { input_guard: 4, retrieve: 62, reason_draft: 605, output_guard: 9 },
      inr_cost: 0.0058,
      output: 'Under Scholarship Policy 2026-27 (§3.1), family income must not exceed INR 3,00,000 for Tier 1 100% waiver.',
      retrieved_chunks: [
        { title: 'Scholarship Policy 2026-27', section: '§3.1', citation: 'Scholarship Policy 2026-27, §3.1, 2026-27', score: 0.032 },
      ],
    },
    {
      run_id: 'run_sample_02',
      timestamp: '2026-10-12 09:22:40',
      role: 'student',
      masked_input: 'When is the last date and deadline for need based aid?',
      route: 'faq_rule_engine',
      status: 'success',
      failure_id: null,
      guards_fired: [],
      prompt_tokens: 0,
      completion_tokens: 0,
      latency_ms: 12,
      latency_breakdown: { input_guard: 3, router: 9 },
      inr_cost: 0.0,
      output: 'Official application deadline is 31 October 2026 (Circular Oct-2026 Revision, §2.0).',
      retrieved_chunks: [],
    },
  ];
}

export default async function TraceViewerPage({
  searchParams,
}: {
  searchParams?: {
    role?: string;
    status?: string;
    guard?: string;
    failureId?: string;
  };
}) {
  const role = searchParams?.role || '';
  const status = searchParams?.status || '';
  const guard = searchParams?.guard || '';
  const failureId = searchParams?.failureId || '';

  const traces = await fetchTraces({ role, status, guard, failureId });

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <a href="/admin" className="sap-btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem' }}>
          ← Back to Admin Hub
        </a>
      </div>

      <div className="sap-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid var(--sap-brand-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div>
            <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
              System Observability & Auditing
            </span>
            <h1 className="govuk-heading-xl" style={{ margin: '0.2rem 0', fontSize: '1.65rem' }}>
              Execution Trace Monitor
            </h1>
          </div>
          <a href={`${API_BASE_URL}/api/traces/export/csv`} download className="sap-btn sap-btn--default" style={{ margin: 0 }}>
            📥 Export All Traces (CSV)
          </a>
        </div>
        <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
          Inspect complete per-run execution metadata: masked prompts, node latencies, token consumption,
          INR expenditure, and fired security guardrails.
        </p>
      </div>

      {/* Filter Bar (Pure HTML Form - works without client JS) */}
      <div className="sap-card" style={{ marginBottom: '2rem', backgroundColor: '#f8fafd' }}>
        <h2 className="govuk-heading-s" style={{ marginTop: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sap-text-secondary)' }}>
          Trace Filter Criteria
        </h2>
        <form method="GET" action="/admin/traces">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label className="govuk-label" htmlFor="role" style={{ fontSize: '13px' }}>Role</label>
              <select id="role" name="role" className="govuk-select" defaultValue={role} style={{ minWidth: '140px' }}>
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="committee">Committee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="govuk-label" htmlFor="status" style={{ fontSize: '13px' }}>Status</label>
              <select id="status" name="status" className="govuk-select" defaultValue={status} style={{ minWidth: '140px' }}>
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="refused">Refused</option>
                <option value="pending_approval">Pending Approval</option>
              </select>
            </div>

            <div>
              <label className="govuk-label" htmlFor="guard" style={{ fontSize: '13px' }}>Guardrail Fired</label>
              <select id="guard" name="guard" className="govuk-select" defaultValue={guard} style={{ minWidth: '180px' }}>
                <option value="">All Guardrails</option>
                <option value="pii_masking_guard">PII Masking (F3)</option>
                <option value="input_injection_guard">Prompt Injection (F2)</option>
                <option value="distress_router_guard">Distress Router (F8)</option>
                <option value="off_topic_guard">Off-Topic Refusal (F9)</option>
                <option value="prohibit_unauthorized_commitments">Commitment Prohibition (F6)</option>
              </select>
            </div>

            <div>
              <label className="govuk-label" htmlFor="failureId" style={{ fontSize: '13px' }}>Failure ID</label>
              <input
                id="failureId"
                name="failureId"
                className="govuk-input"
                defaultValue={failureId}
                placeholder="e.g. F1, F2..."
                style={{ maxWidth: '120px' }}
              />
            </div>

            <button type="submit" className="sap-btn sap-btn--emphasized" style={{ margin: 0 }}>
              Apply Filter
            </button>
            <a href="/admin/traces" className="sap-btn sap-btn--default" style={{ margin: 0 }}>
              Reset
            </a>
          </div>
        </form>
      </div>

      {/* Traces List */}
      <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Logged Execution Trajectories ({traces.length})
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {traces.map((trace) => (
          <div
            key={trace.run_id}
            className="sap-card"
            style={{
              padding: '1.35rem 1.5rem',
              borderLeft: trace.status === 'refused' ? '4px solid var(--sap-negative-text)' : '4px solid var(--sap-positive-text)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div>
                <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
                  Run ID: <strong>{trace.run_id}</strong> &nbsp;|&nbsp; {trace.timestamp} &nbsp;|&nbsp; Role: <strong>{trace.role.toUpperCase()}</strong>
                </span>
                <div style={{ marginTop: '0.25rem', fontWeight: 600 }}>
                  Route: <code style={{ backgroundColor: '#f0f4f8', padding: '2px 6px', borderRadius: '4px' }}>{trace.route}</code>
                  {trace.failure_id && (
                    <span className="sap-badge sap-badge--warning" style={{ marginLeft: '0.5rem' }}>
                      Case {trace.failure_id}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`sap-badge ${trace.status === 'refused' ? 'sap-badge--error' : 'sap-badge--success'}`}>
                  {trace.status.toUpperCase()}
                </span>
                <div className="govuk-body-s" style={{ marginTop: '0.25rem', fontVariantNumeric: 'tabular-nums' }}>
                  Latency: <strong>{trace.latency_ms}ms</strong> &nbsp;|&nbsp; Cost: <strong>₹{trace.inr_cost.toFixed(4)}</strong>
                </div>
              </div>
            </div>

            {/* Fired Guards Badges */}
            {trace.guards_fired.length > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <span className="govuk-body-s" style={{ marginRight: '0.5rem', fontWeight: 600 }}>Guards Intercepted:</span>
                {trace.guards_fired.map((g) => (
                  <span key={g} className="sap-badge sap-badge--error" style={{ marginRight: '0.35rem', marginBottom: '0.25rem' }}>
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="govuk-body" style={{ margin: '0.5rem 0', fontSize: '14px' }}>
              <strong>Masked Input:</strong> <span style={{ color: 'var(--sap-text-primary)' }}>{trace.masked_input}</span>
            </div>

            <div className="govuk-body" style={{ margin: '0.5rem 0', whiteSpace: 'pre-line', fontSize: '14px' }}>
              <strong>Output:</strong> <span style={{ color: 'var(--sap-text-secondary)' }}>{trace.output}</span>
            </div>

            {/* Trace Details Accordion */}
            <details className="govuk-details" style={{ marginTop: '0.75rem', backgroundColor: '#f8fafd' }}>
              <summary className="govuk-details__summary">
                <span>View Full Execution Trace & Latency Breakdown</span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body-s">
                  <strong>Token Accounting:</strong> Prompt Tokens: {trace.prompt_tokens} &nbsp;|&nbsp; Completion Tokens: {trace.completion_tokens}
                </p>
                <div className="govuk-body-s">
                  <strong>Latency Breakdown by Graph Node:</strong>
                  <pre style={{ margin: '0.35rem 0', padding: '0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--sap-border-hairline)', borderRadius: '4px', fontSize: '12px' }}>
                    {JSON.stringify(trace.latency_breakdown, null, 2)}
                  </pre>
                </div>
                {trace.retrieved_chunks.length > 0 && (
                  <div className="govuk-body-s" style={{ marginTop: '0.5rem' }}>
                    <strong>Retrieved Knowledge Chunks ({trace.retrieved_chunks.length}):</strong>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                      {trace.retrieved_chunks.map((c, idx) => (
                        <li key={idx}>
                          {c.citation} (Relevance Score: {c.score?.toFixed(4)})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
