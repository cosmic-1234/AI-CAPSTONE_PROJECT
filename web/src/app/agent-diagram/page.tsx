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
      <div style={{ marginBottom: '1.25rem' }}>
        <a href="/" className="sap-btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem' }}>
          ← Back to Launchpad
        </a>
      </div>

      <div className="sap-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid var(--sap-brand-blue)' }}>
        <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
          Graph Engine Architecture
        </span>
        <h1 className="govuk-heading-xl" style={{ margin: '0.2rem 0', fontSize: '1.65rem' }}>
          Agent Workflow & State Architecture
        </h1>
        <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
          Visual representation of the explicit LangGraph.js execution graph, state transitions,
          guardrail interceptors, and human-in-the-loop decision boundaries.
        </p>
      </div>

      {/* State Transition Flowchart */}
      <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        State Transition Topology (Mermaid DSL)
      </h2>
      <div
        className="sap-card"
        style={{
          backgroundColor: '#f8fafd',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto',
          borderLeft: '4px solid var(--sap-brand-blue)',
        }}
      >
        {data.mermaid}
      </div>

      <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Graph Node Specifications & Defensible Routing
      </h2>
      <table className="govuk-summary-list" style={{ marginBottom: '2.5rem' }}>
        <tbody>
          {data.nodes.map((node) => (
            <tr key={node.id} className="govuk-summary-list__row">
              <th className="govuk-summary-list__key" style={{ width: '28%' }}>
                <code style={{ backgroundColor: '#f0f4f8', padding: '2px 6px', borderRadius: '4px' }}>{node.id}</code>
              </th>
              <td className="govuk-summary-list__value">{node.label}</td>
              <td className="govuk-summary-list__actions">
                <span className="sap-badge sap-badge--success">ACTIVE</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Defensible Design Notes */}
      <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Architectural Defensibility Rationale
      </h2>
      <div className="govuk-grid-row">
        <div className="sap-card" style={{ borderTop: '3px solid var(--sap-brand-blue)' }}>
          <h3 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.15rem' }}>Zero-Token FAQ Short-Circuit</h3>
          <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)' }}>
            Deterministic calendar deadlines and official office contacts bypass LLM generation entirely, eliminating token costs and preventing hallucination on factual administrative data.
          </p>
        </div>
        <div className="sap-card" style={{ borderTop: '3px solid #107e3e' }}>
          <h3 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.15rem' }}>Emergency Distress Bypasses</h3>
          <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)' }}>
            Suicide or extreme hardship expressions immediately short-circuit to a dedicated Counselling Cell referral docket with zero LLM generation delay.
          </p>
        </div>
        <div className="sap-card" style={{ borderTop: '3px solid #b78103' }}>
          <h3 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.15rem' }}>Human Approval Gate</h3>
          <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)' }}>
            All disbursement notes and notifications are held in a pending state with unique idempotency keys. The agent is strictly prohibited from approving, rejecting, or disbursing.
          </p>
        </div>
      </div>
    </div>
  );
}
