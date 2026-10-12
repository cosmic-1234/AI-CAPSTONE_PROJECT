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
          Comprehensive management desk for institutional policy documents, audit activity,
          system compliance controls, and evaluation benchmarks.
        </p>
      </div>

      {/* System Governance Ribbon */}
      <div className="sap-ai-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '13px', color: 'var(--sap-ai-badge-text)', fontWeight: 600 }}>
          <span className="sap-ai-pulse-dot" />
          <span>System Governance &amp; Policy Service Active</span>
          <span className="sap-ai-step-pill">Policy Rules Enforced</span>
          <span className="sap-ai-step-pill">Statute Grounded</span>
        </div>
        <a href="/admin/eval" className="sap-btn sap-btn--ai" style={{ fontSize: '12px', padding: '0.25rem 0.65rem' }}>
          Run Evaluation Suite
        </a>
      </div>

      {/* Admin Modules Grid */}
      <div className="govuk-grid-row">
        <div className="sap-card" style={{ borderTop: '3px solid var(--sap-brand-blue)' }}>
          <div>
            <span className="sap-badge sap-badge--neutral" style={{ marginBottom: '0.5rem' }}>DOCUMENTS</span>
            <h2 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.2rem' }}>
              Policy Documents Registry
            </h2>
            <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)', marginBottom: '1.25rem' }}>
              Audit indexed scholarship circulars, access categories, document versions, and synchronize policy updates.
            </p>
          </div>
          <a href="/admin/kb" className="sap-btn sap-btn--default">
            Open Policy Registry →
          </a>
        </div>

        <div className="sap-card" style={{ borderTop: '3px solid #107e3e' }}>
          <div>
            <span className="sap-badge sap-badge--success" style={{ marginBottom: '0.5rem' }}>AUDIT LOGS</span>
            <h2 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.2rem' }}>
              Audit & Activity Logs
            </h2>
            <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)', marginBottom: '1.25rem' }}>
              Inspect inquiry activity, response latency, compliance checks, and download official audit reports as CSV.
            </p>
          </div>
          <a href="/admin/traces" className="sap-btn sap-btn--default">
            Open Activity Monitor →
          </a>
        </div>

        <div className="sap-card" style={{ borderTop: '3px solid #bb0000' }}>
          <div>
            <span className="sap-badge sap-badge--error" style={{ marginBottom: '0.5rem' }}>COMPLIANCE</span>
            <h2 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.2rem' }}>
              Compliance & Security Desk
            </h2>
            <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)', marginBottom: '1.25rem' }}>
              Review compliance rules, inspect policy enforcement flags, and generate governance remediation reports.
            </p>
          </div>
          <a href="/admin/red-team" className="sap-btn sap-btn--default">
            Open Compliance Desk →
          </a>
        </div>

        <div className="sap-card" style={{ borderTop: '3px solid #e9730c' }}>
          <div>
            <span className="sap-badge sap-badge--warning" style={{ marginBottom: '0.5rem' }}>BENCHMARKING</span>
            <h2 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.2rem' }}>
              Quality & Evaluation Benchmarks
            </h2>
            <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)', marginBottom: '1.25rem' }}>
              Run automated benchmark suites, view target vs actual metrics, and download verification reports.
            </p>
          </div>
          <a href="/admin/eval" className="sap-btn sap-btn--default">
            Open Evaluation Suite →
          </a>
        </div>
      </div>

      <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Administrative Governance Responsibilities
      </h2>
      <table className="govuk-summary-list" style={{ marginBottom: '2.5rem' }}>
        <tbody>
          <tr className="govuk-summary-list__row">
            <th className="govuk-summary-list__key">Data Privacy Safeguards</th>
            <td className="govuk-summary-list__value">
              Strictly verify that student records and personal identity details remain protected and confidential.
            </td>
            <td className="govuk-summary-list__actions">
              <span className="sap-badge sap-badge--success">ENFORCED</span>
            </td>
          </tr>
          <tr className="govuk-summary-list__row">
            <th className="govuk-summary-list__key">Policy Currency Control</th>
            <td className="govuk-summary-list__value">
              Outdated circulars and superseded scholarship guidelines are archived to prevent discrepancies.
            </td>
            <td className="govuk-summary-list__actions">
              <span className="sap-badge sap-badge--success">ACTIVE</span>
            </td>
          </tr>
          <tr className="govuk-summary-list__row">
            <th className="govuk-summary-list__key">Performance Caching</th>
            <td className="govuk-summary-list__value">
              Frequently requested policy guidance is securely cached to ensure fast and consistent responses.
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
