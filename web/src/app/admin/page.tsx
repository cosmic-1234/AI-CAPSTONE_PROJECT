import { getCurrentUser } from '@/lib/session';

export default async function AdminHubPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <a href="/" className="sap-btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem' }}>
          ← Back to Launchpad
        </a>
      </div>

      <div className="sap-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid var(--sap-brand-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src="/brand/iimbg-logo.png"
              alt="IIM Bodh Gaya Emblem"
              width="60"
              height="48"
              style={{ objectFit: 'contain', backgroundColor: '#ffffff', padding: '3px', borderRadius: '4px', border: '1px solid #e2e4e8' }}
            />
            <div>
              <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
                System Governance
              </span>
              <h1 className="govuk-heading-xl" style={{ margin: '0.2rem 0', fontSize: '1.65rem' }}>
                Administrator Operations Hub
              </h1>
            </div>
          </div>
          <span className="sap-badge sap-badge--info">
            Administrator: {user.name}
          </span>
        </div>
        <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
          Comprehensive management desk for knowledge base manifests, trace observability,
          guardrail hardening toggles, and system evaluation runs.
        </p>
      </div>

      {/* Admin Modules Grid */}
      <div className="govuk-grid-row">
        <div className="sap-card" style={{ borderTop: '3px solid var(--sap-brand-blue)' }}>
          <div>
            <span className="sap-badge sap-badge--neutral" style={{ marginBottom: '0.5rem' }}>CORPUS AUDIT</span>
            <h2 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.2rem' }}>
              Knowledge Base Manager
            </h2>
            <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)', marginBottom: '1.25rem' }}>
              Audit indexed policy versions, access levels (public vs staff), manifest metadata, and trigger embedding re-ingestion.
            </p>
          </div>
          <a href="/admin/kb" className="sap-btn sap-btn--default">
            Open KB Registry →
          </a>
        </div>

        <div className="sap-card" style={{ borderTop: '3px solid #107e3e' }}>
          <div>
            <span className="sap-badge sap-badge--success" style={{ marginBottom: '0.5rem' }}>TELEMETRY</span>
            <h2 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.2rem' }}>
              Trace Observability
            </h2>
            <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)', marginBottom: '1.25rem' }}>
              Inspect per-run execution logs, node latencies, INR token costs, fired guardrails, and export audit traces as CSV.
            </p>
          </div>
          <a href="/admin/traces" className="sap-btn sap-btn--default">
            Open Trace Monitor →
          </a>
        </div>

        <div className="sap-card" style={{ borderTop: '3px solid #bb0000' }}>
          <div>
            <span className="sap-badge sap-badge--error" style={{ marginBottom: '0.5rem' }}>SECURITY & RED-TEAM</span>
            <h2 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.2rem' }}>
              Red-Team Switchboard
            </h2>
            <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)', marginBottom: '1.25rem' }}>
              Switchboard for failures F1–F15: toggle hardening flags, run attack inputs, and generate failure remediation reports.
            </p>
          </div>
          <a href="/admin/red-team" className="sap-btn sap-btn--default">
            Open Red-Team →
          </a>
        </div>

        <div className="sap-card" style={{ borderTop: '3px solid #e9730c' }}>
          <div>
            <span className="sap-badge sap-badge--warning" style={{ marginBottom: '0.5rem' }}>BENCHMARKING</span>
            <h2 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.2rem' }}>
              Evaluation & Benchmarks
            </h2>
            <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)', marginBottom: '1.25rem' }}>
              Run automated evaluation suites, view target vs actual metrics, and download HTML & CSV evaluation reports.
            </p>
          </div>
          <a href="/admin/eval" className="sap-btn sap-btn--default">
            Open Evaluation Suite →
          </a>
        </div>

        <div className="sap-card" style={{ borderTop: '3px solid var(--sap-brand-blue)' }}>
          <div>
            <span className="sap-badge sap-badge--neutral" style={{ marginBottom: '0.5rem' }}>ARCHITECTURE</span>
            <h2 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.2rem' }}>
              Agent Workflow Diagram
            </h2>
            <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)', marginBottom: '1.25rem' }}>
              View the compiled LangGraph.js state machine diagram, loop bounds, and architectural decision nodes.
            </p>
          </div>
          <a href="/agent-diagram" className="sap-btn sap-btn--default">
            View Graph Topology →
          </a>
        </div>
      </div>

      <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Administrative Governance Responsibilities
      </h2>
      <table className="govuk-summary-list" style={{ marginBottom: '2.5rem' }}>
        <tbody>
          <tr className="govuk-summary-list__row">
            <th className="govuk-summary-list__key">Synthetic Data Integrity</th>
            <td className="govuk-summary-list__value">
              Strictly verify that zero real student records or Aadhaar numbers enter external model requests.
            </td>
            <td className="govuk-summary-list__actions">
              <span className="sap-badge sap-badge--success">ENFORCED</span>
            </td>
          </tr>
          <tr className="govuk-summary-list__row">
            <th className="govuk-summary-list__key">Superseded Policy Guard</th>
            <td className="govuk-summary-list__value">
              2025-26 superseded scholarship circulars are blocked by default to prevent outdated aid calculations.
            </td>
            <td className="govuk-summary-list__actions">
              <span className="sap-badge sap-badge--success">ACTIVE</span>
            </td>
          </tr>
          <tr className="govuk-summary-list__row">
            <th className="govuk-summary-list__key">Zero-Cost LLM Caching</th>
            <td className="govuk-summary-list__value">
              All repeated evaluation prompts are cached by SHA-256 hash in SQLite, preventing unnecessary cloud spend.
            </td>
            <td className="govuk-summary-list__actions">
              <span className="sap-badge sap-badge--success">ENABLED</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
