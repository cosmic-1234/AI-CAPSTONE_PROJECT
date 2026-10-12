import { getCurrentUser } from '@/lib/session';

export default async function AdminHubPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <a href="/" className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to Home
      </a>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <h1 className="govuk-heading-xl" style={{ margin: 0 }}>
          Administrator Governance Hub
        </h1>
        <span className="govuk-tag govuk-tag--grey">
          Admin: {user.name}
        </span>
      </div>

      <p className="govuk-body-lead">
        Comprehensive management desk for knowledge base manifests, trace observability,
        guardrail hardening toggles, and system evaluation runs.
      </p>

      {/* Admin Modules Grid */}
      <div className="govuk-grid-row">
        <div className="govuk-card">
          <h2 className="govuk-heading-m" style={{ marginTop: 0 }}>
            Knowledge Base Manager
          </h2>
          <p className="govuk-body">
            Audit indexed policy versions, access levels (public vs staff), manifest metadata, and trigger embedding re-ingestion.
          </p>
          <a href="/admin/kb" className="govuk-button">
            Open KB Manager
          </a>
        </div>

        <div className="govuk-card">
          <h2 className="govuk-heading-m" style={{ marginTop: 0 }}>
            Trace Viewer & Observability
          </h2>
          <p className="govuk-body">
            Inspect per-run execution logs, node latencies, INR token costs, fired guardrails, and export audit traces as CSV.
          </p>
          <a href="/admin/traces" className="govuk-button">
            Open Trace Viewer
          </a>
        </div>

        <div className="govuk-card">
          <h2 className="govuk-heading-m" style={{ marginTop: 0 }}>
            Red-Team Switchboard
          </h2>
          <p className="govuk-body">
            Switchboard for failures F1–F15: toggle hardening flags, run attack inputs, and generate failure remediation reports.
          </p>
          <a href="/admin/red-team" className="govuk-button">
            Open Red-Team
          </a>
        </div>

        <div className="govuk-card">
          <h2 className="govuk-heading-m" style={{ marginTop: 0 }}>
            Evaluation & Benchmark
          </h2>
          <p className="govuk-body">
            Run automated evaluation suites, view target vs actual metrics, and download HTML & CSV evaluation reports.
          </p>
          <a href="/admin/eval" className="govuk-button">
            Open Evaluation Hub
          </a>
        </div>

        <div className="govuk-card">
          <h2 className="govuk-heading-m" style={{ marginTop: 0 }}>
            Agent Workflow Diagram
          </h2>
          <p className="govuk-body">
            View the compiled LangGraph.js state machine diagram, loop bounds, and architectural decision nodes.
          </p>
          <a href="/agent-diagram" className="govuk-button govuk-button--secondary">
            View State Diagram
          </a>
        </div>
      </div>

      <h2 className="govuk-heading-l">Administrative Responsibilities</h2>
      <table className="govuk-summary-list">
        <tbody>
          <tr className="govuk-summary-list__row">
            <th className="govuk-summary-list__key">Synthetic Data Integrity</th>
            <td className="govuk-summary-list__value">
              Strictly verify that zero real student records or Aadhaar numbers enter external model requests.
            </td>
            <td className="govuk-summary-list__actions">
              <span className="govuk-tag govuk-tag--green">ENFORCED</span>
            </td>
          </tr>
          <tr className="govuk-summary-list__row">
            <th className="govuk-summary-list__key">Superseded Policy Guard</th>
            <td className="govuk-summary-list__value">
              2025-26 superseded scholarship circulars are blocked by default to prevent outdated aid calculations.
            </td>
            <td className="govuk-summary-list__actions">
              <span className="govuk-tag govuk-tag--green">ACTIVE</span>
            </td>
          </tr>
          <tr className="govuk-summary-list__row">
            <th className="govuk-summary-list__key">Zero-Cost LLM Caching</th>
            <td className="govuk-summary-list__value">
              All repeated evaluation prompts are cached by SHA-256 hash in SQLite, preventing unnecessary cloud spend.
            </td>
            <td className="govuk-summary-list__actions">
              <span className="govuk-tag govuk-tag--green">ENABLED</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
