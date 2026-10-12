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
      <a href="/" className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to Home
      </a>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <h1 className="govuk-heading-xl" style={{ margin: 0 }}>
          Accounts Verification Queue
        </h1>
        <span className="govuk-tag govuk-tag--grey">
          Staff Desk: {user.name} ({user.role.toUpperCase()})
        </span>
      </div>

      <p className="govuk-body-lead">
        Verify submitted income certificates, audit 12-month validity dates, and execute cross-document
        consistency checks against parent ITR-V filings.
      </p>

      {/* Cross-Verification Hardening Banner (F15) */}
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon">!</span>
        <div>
          <strong>Automated Consistency Engine (Guardrail F15 Active):</strong>
          <p className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
            The system cross-checks Income Certificate figures against ITR-V Gross Total Income. Any variance exceeding INR 1,00,000 is automatically flagged to prevent inaccurate waiver disbursements.
          </p>
        </div>
      </div>

      {/* Queue Table */}
      <h2 className="govuk-heading-l">Pending Application Dockets</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        {QUEUE_ITEMS.map((item) => (
          <div
            key={item.id}
            style={{
              border: '1px solid #b1b4b6',
              padding: '1.5rem',
              backgroundColor: '#ffffff',
              borderLeft: item.is_consistent ? '4px solid #00703c' : '4px solid #d4351c',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div>
                <span className="govuk-body-s" style={{ textTransform: 'uppercase', color: '#505a5f' }}>
                  Docket: <strong>{item.id}</strong> | Applicant: <strong>{item.student_name}</strong> ({item.programme})
                </span>
                <h3 className="govuk-heading-m" style={{ margin: '0.25rem 0' }}>{item.scheme}</h3>
              </div>
              <span className={`govuk-tag ${item.is_consistent ? 'govuk-tag--green' : 'govuk-tag--red'}`}>
                {item.is_consistent ? 'DOCUMENTS CONSISTENT' : 'INCONSISTENCY FLAGGED (F15)'}
              </span>
            </div>

            <table className="govuk-summary-list" style={{ marginBottom: '1rem' }}>
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
                  <tr className="govuk-summary-list__row" style={{ backgroundColor: '#f9d6d3' }}>
                    <th className="govuk-summary-list__key" style={{ color: '#942514' }}>Audit Finding</th>
                    <td className="govuk-summary-list__value" style={{ color: '#942514' }}>
                      {item.inconsistency_reason}
                    </td>
                    <td className="govuk-summary-list__actions"></td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="govuk-button-group" style={{ margin: 0 }}>
              {item.is_consistent ? (
                <button type="button" className="govuk-button">
                  Approve Verification & Forward to Committee
                </button>
              ) : (
                <>
                  <button type="button" className="govuk-button govuk-button--warning">
                    Place on Disciplinary Hold (Flagged)
                  </button>
                  <a href={`/chat?q=Why+was+application+${item.id}+flagged+for+income+inconsistency%3F`} className="govuk-button govuk-button--secondary">
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
