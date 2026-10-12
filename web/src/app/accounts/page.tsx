import { getCurrentUser } from '@/lib/session';

interface AccountQueueItem {
  id: string;
  student_name: string;
  student_id: string;
  programme: string;
  declared_income: number;
  itr_income: number;
  scheme: string;
  cert_date: string;
  is_consistent: boolean;
  inconsistency_reason?: string;
  verification_status: 'verified' | 'pending' | 'flagged';
}

const QUEUE_ITEMS: AccountQueueItem[] = [
  {
    id: 'app_101',
    student_name: 'Amit Kumar',
    student_id: 'std_01',
    programme: 'PGP (2025-27)',
    declared_income: 240000,
    itr_income: 580000, // Discrepancy!
    scheme: 'NBFA Tier 1 (100% Tuition Waiver)',
    cert_date: '2026-04-12 (Valid)',
    is_consistent: false,
    inconsistency_reason: 'Income Certificate declares INR 2,40,000, whereas parent ITR-V Gross Total Income indicates INR 5,80,000 (INR 3.4L discrepancy).',
    verification_status: 'flagged',
  },
  {
    id: 'app_102',
    student_name: 'Priya Sharma',
    student_id: 'std_02',
    programme: 'PGP (2025-27)',
    declared_income: 520000,
    itr_income: 525000,
    scheme: 'NBFA Tier 2 (50% Tuition Waiver)',
    cert_date: '2026-05-18 (Valid)',
    is_consistent: true,
    verification_status: 'verified',
  },
  {
    id: 'app_103',
    student_name: 'Rahul Verma',
    student_id: 'std_03',
    programme: 'IPM (2026-28)',
    declared_income: 180000,
    itr_income: 180000,
    scheme: 'NBFA Tier 1 (100% Tuition Waiver)',
    cert_date: '2026-02-10 (Valid)',
    is_consistent: true,
    verification_status: 'pending',
  },
];

export default async function AccountsQueuePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <a href="/" className="sap-btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem' }}>
          ← Back to Launchpad
        </a>
      </div>

      {/* SAP Dynamic Object Header */}
      <div className="sap-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid var(--sap-brand-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
              Accounts & Audit Desk
            </span>
            <h1 className="govuk-heading-xl" style={{ margin: '0.2rem 0', fontSize: '1.65rem' }}>
              Document Verification & Cross-Audit Worklist
            </h1>
          </div>
          <span className="sap-badge sap-badge--info">
            Auditor: {user.name} ({user.role.toUpperCase()})
          </span>
        </div>
        <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
          Audit submitted income certificates, verify 12-month validity dates, and execute cross-document
          consistency checks against parent ITR-V filings prior to Aid Committee review.
        </p>

        {/* Worklist KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--sap-border-hairline)' }}>
          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f8fafd', borderRadius: 'var(--sap-radius-sm)', border: '1px solid var(--sap-border-hairline)' }}>
            <span className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)', display: 'block' }}>Pending in Queue</span>
            <strong style={{ fontSize: '18px', color: 'var(--sap-text-primary)' }}>{QUEUE_ITEMS.length} Dockets</strong>
          </div>
          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--sap-positive-bg)', borderRadius: 'var(--sap-radius-sm)', border: '1px solid var(--sap-positive-border)' }}>
            <span className="govuk-body-s" style={{ color: 'var(--sap-positive-text)', display: 'block' }}>Verified Clean</span>
            <strong style={{ fontSize: '18px', color: 'var(--sap-positive-text)' }}>
              {QUEUE_ITEMS.filter((i) => i.is_consistent).length} Dockets
            </strong>
          </div>
          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--sap-negative-bg)', borderRadius: 'var(--sap-radius-sm)', border: '1px solid var(--sap-negative-border)' }}>
            <span className="govuk-body-s" style={{ color: 'var(--sap-negative-text)', display: 'block' }}>Variance Flagged (F15)</span>
            <strong style={{ fontSize: '18px', color: 'var(--sap-negative-text)' }}>
              {QUEUE_ITEMS.filter((i) => !i.is_consistent).length} Dockets
            </strong>
          </div>
        </div>
      </div>

      {/* Cross-Verification Hardening Callout */}
      <div className="govuk-warning-text" style={{ marginBottom: '1.75rem' }}>
        <span className="govuk-warning-text__icon">!</span>
        <div>
          <strong>Automated Consistency Engine (Guardrail F15 Active):</strong>
          <p className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
            The system cross-checks Income Certificate figures against ITR-V Gross Total Income. Any variance exceeding INR 1,00,000 is automatically flagged to prevent inaccurate waiver disbursements.
          </p>
        </div>
      </div>

      {/* Worklist Items */}
      <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Pending Verification Dockets
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {QUEUE_ITEMS.map((item) => (
          <div
            key={item.id}
            className="sap-card"
            style={{
              borderLeft: item.is_consistent ? '4px solid var(--sap-positive-text)' : '4px solid var(--sap-negative-text)',
              padding: '1.35rem 1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <div>
                <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
                  Docket: <strong>{item.id}</strong> &nbsp;|&nbsp; Student: <strong>{item.student_name}</strong> ({item.programme})
                </span>
                <h3 className="govuk-heading-m" style={{ margin: '0.25rem 0', fontSize: '1.15rem' }}>{item.scheme}</h3>
              </div>
              <span className={`sap-badge ${item.is_consistent ? 'sap-badge--success' : 'sap-badge--error'}`}>
                {item.is_consistent ? 'DOCUMENTS CONSISTENT' : 'INCONSISTENCY FLAGGED (F15)'}
              </span>
            </div>

            <table className="govuk-summary-list" style={{ marginBottom: '1.25rem' }}>
              <tbody>
                <tr className="govuk-summary-list__row">
                  <th className="govuk-summary-list__key">Income Certificate Figure</th>
                  <td className="govuk-summary-list__value">INR {item.declared_income.toLocaleString('en-IN')} ({item.cert_date})</td>
                  <td className="govuk-summary-list__actions"></td>
                </tr>
                <tr className="govuk-summary-list__row">
                  <th className="govuk-summary-list__key">ITR-V Gross Total Income</th>
                  <td className="govuk-summary-list__value">INR {item.itr_income.toLocaleString('en-IN')} (AY 2026-27)</td>
                  <td className="govuk-summary-list__actions"></td>
                </tr>
                {!item.is_consistent && (
                  <tr className="govuk-summary-list__row" style={{ backgroundColor: 'var(--sap-negative-bg)' }}>
                    <th className="govuk-summary-list__key" style={{ color: 'var(--sap-negative-text)', fontWeight: 700 }}>
                      Audit Finding
                    </th>
                    <td className="govuk-summary-list__value" style={{ color: 'var(--sap-negative-text)', fontWeight: 600 }}>
                      {item.inconsistency_reason}
                    </td>
                    <td className="govuk-summary-list__actions"></td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* SAP Fiori Button Matrix Actions */}
            <div className="govuk-button-group" style={{ margin: 0 }}>
              {item.is_consistent ? (
                <button type="button" className="sap-btn sap-btn--accept">
                  ✓ Approve Verification & Forward to Committee
                </button>
              ) : (
                <>
                  <button type="button" className="sap-btn sap-btn--reject">
                    ✕ Place on Disciplinary Hold (Flagged)
                  </button>
                  <a href={`/chat?q=Why+was+application+${item.id}+flagged+for+income+inconsistency%3F`} className="sap-btn sap-btn--default">
                    Run Verification Audit
                  </a>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
