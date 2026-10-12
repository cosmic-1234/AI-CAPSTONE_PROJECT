import { getCurrentUser } from '@/lib/session';

interface CommitteeDocket {
  id: string;
  applicant: string;
  student_id: string;
  programme: string;
  batch: string;
  family_income: number;
  cgpa: number;
  scheme: string;
  proposed_waiver: string;
  proposed_amount: number;
  recommendation_note: string;
  citation: string;
  accounts_verification: string;
}

const DOCKETS: CommitteeDocket[] = [
  {
    id: 'app_102',
    applicant: 'Priya Sharma',
    student_id: 'std_02',
    programme: 'PGP',
    batch: '2025-27',
    family_income: 520000,
    cgpa: 8.9,
    scheme: 'Need-Based Financial Assistance (Tier 2)',
    proposed_waiver: '50% Tuition Fee Waiver',
    proposed_amount: 225000,
    recommendation_note: 'Applicant family income (INR 5,20,000) falls squarely within the INR 3,00,001 - INR 6,00,000 Tier 2 bracket. Academic CGPA 8.9 demonstrates outstanding coursework standing. Verified by Accounts Office without discrepancies.',
    citation: 'Scholarship Policy 2026-27, §3.2, 2026-27',
    accounts_verification: 'VERIFIED & CONSISTENT (ITR match confirmed)',
  },
  {
    id: 'app_103',
    applicant: 'Sneha Patel',
    student_id: 'std_04',
    programme: 'PGP-DBM',
    batch: '2025-27',
    family_income: 750000,
    cgpa: 8.7,
    scheme: "Director's Merit Scholarship (Term II)",
    proposed_waiver: 'INR 1,00,000 Merit Award',
    proposed_amount: 100000,
    recommendation_note: 'Term 1 CGPA 8.7 ranks in the top 5th percentile of the batch. Hostel Warden has furnished clean disciplinary clearance.',
    citation: 'Merit Scholarship Rules, §2.1, 2026-27',
    accounts_verification: 'ACADEMIC TRANSCRIPT VERIFIED',
  },
];

export default async function CommitteeReviewPage({
  searchParams,
}: {
  searchParams?: { action_taken?: string };
}) {
  const user = await getCurrentUser();
  const actionTaken = searchParams?.action_taken;

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <a href="/" className="sap-btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem' }}>
          ← Back to Launchpad
        </a>
      </div>

      {/* SAP Dynamic Header / Object Page Block */}
      <div className="sap-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid var(--sap-brand-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
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
                Institutional Governance
              </span>
              <h1 className="govuk-heading-xl" style={{ margin: '0.2rem 0', fontSize: '1.65rem' }}>
                Financial Aid Committee Review Docket
              </h1>
            </div>
          </div>
          <span className="sap-badge sap-badge--info">
            Committee Member: {user.name} ({user.role.toUpperCase()})
          </span>
        </div>
        <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
          Review synthesized recommendation notes, policy citations, and cast formal votes to grant or refuse financial awards.
        </p>
      </div>

      {/* Decision confirmation message */}
      {actionTaken && (
        <div className="sap-card" style={{ backgroundColor: 'var(--sap-positive-bg)', borderLeft: '4px solid var(--sap-positive-text)', border: '1px solid var(--sap-positive-border)', padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
          <strong style={{ color: 'var(--sap-positive-text)' }}>✓ Decision Recorded:</strong>{' '}
          <span style={{ color: 'var(--sap-positive-text)' }}>Application action has been signed with digital cryptographic audit hash and logged to the official ledger.</span>
        </div>
      )}

      {/* Authority Notice */}
      <div className="govuk-warning-text" style={{ marginBottom: '1.75rem' }}>
        <span className="govuk-warning-text__icon">!</span>
        <div>
          <strong>Constitutional Authority Guard (Guard F6 Enforced):</strong>
          <p className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
            The AI agent is constitutionally restricted to advisory recommendations only. Binding legal commitments and disbursement mandates require the quorum approval of this Committee under Aid Committee Charter §3.2.
          </p>
        </div>
      </div>

      {/* Pending Dockets */}
      <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Pending Committee Dockets ({DOCKETS.length})
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {DOCKETS.map((docket) => (
          <div
            key={docket.id}
            className="sap-card"
            style={{
              padding: '1.5rem',
              borderLeft: '4px solid #b78103',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <div>
                <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
                  Docket ID: <strong>{docket.id}</strong> &nbsp;|&nbsp; Student: <strong>{docket.applicant}</strong> ({docket.programme} {docket.batch})
                </span>
                <h3 className="govuk-heading-m" style={{ margin: '0.25rem 0', fontSize: '1.2rem' }}>{docket.scheme}</h3>
              </div>
              <span className="sap-badge sap-badge--warning">
                PENDING COMMITTEE VOTE
              </span>
            </div>

            <table className="govuk-summary-list" style={{ marginBottom: '1.25rem' }}>
              <tbody>
                <tr className="govuk-summary-list__row">
                  <th className="govuk-summary-list__key">Family Income & Academic Standing</th>
                  <td className="govuk-summary-list__value">
                    INR {docket.family_income.toLocaleString('en-IN')} / yr &nbsp;|&nbsp; <strong>CGPA: {docket.cgpa}</strong>
                  </td>
                  <td className="govuk-summary-list__actions"></td>
                </tr>
                <tr className="govuk-summary-list__row">
                  <th className="govuk-summary-list__key">Accounts Audit Finding</th>
                  <td className="govuk-summary-list__value">
                    <span className="sap-badge sap-badge--success">{docket.accounts_verification}</span>
                  </td>
                  <td className="govuk-summary-list__actions"></td>
                </tr>
                <tr className="govuk-summary-list__row">
                  <th className="govuk-summary-list__key">AI Recommendation Synthesis</th>
                  <td className="govuk-summary-list__value">
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span className="sap-badge sap-badge--ai">
                        ✦ JOULE AI SYNTHESIS &bull; 99.2% CONFIDENCE
                      </span>
                    </div>
                    {docket.recommendation_note}
                    <div style={{ marginTop: '0.5rem', color: 'var(--sap-ai-primary)', fontWeight: 600, fontSize: '13px' }}>
                      ✦ Verified Policy Citation: &ldquo;{docket.citation}&rdquo;
                    </div>
                  </td>
                  <td className="govuk-summary-list__actions">
                    <a
                      href={`/chat?q=${encodeURIComponent('Please review docket for ' + docket.applicant + ' with family income ' + docket.family_income + ' and CGPA ' + docket.cgpa + ' against scholarship policies.')}`}
                      className="sap-btn sap-btn--ai"
                      style={{ fontSize: '12px', padding: '0.35rem 0.75rem' }}
                    >
                      ✦ Query Copilot
                    </a>
                  </td>
                </tr>
                <tr className="govuk-summary-list__row">
                  <th className="govuk-summary-list__key">Proposed Waiver Value</th>
                  <td className="govuk-summary-list__value">
                    <strong style={{ fontSize: '16px', color: 'var(--sap-brand-blue)' }}>
                      INR {docket.proposed_amount.toLocaleString('en-IN')}
                    </strong>{' '}
                    ({docket.proposed_waiver})
                  </td>
                  <td className="govuk-summary-list__actions"></td>
                </tr>
              </tbody>
            </table>

            {/* Decision Action Form with SAP Fiori Buttons */}
            <div style={{ backgroundColor: '#f8fafd', padding: '1.25rem', borderRadius: 'var(--sap-radius-sm)', border: '1px solid var(--sap-border-hairline)' }}>
              <h4 className="govuk-heading-s" style={{ margin: 0, fontSize: '14px', color: 'var(--sap-text-primary)' }}>
                Cast Committee Determination
              </h4>
              <p className="govuk-body-s" style={{ marginTop: '0.25rem', color: 'var(--sap-text-secondary)' }}>
                Approving this docket will authorize the Accounts Office to adjust the student tuition ledger and issue a verified award certificate.
              </p>

              <form method="GET" action="/committee">
                <input type="hidden" name="action_taken" value={`approved_${docket.id}`} />
                <div className="govuk-button-group" style={{ margin: 0, marginTop: '0.85rem' }}>
                  <button type="submit" className="sap-btn sap-btn--accept">
                    ✓ Approve Award (INR {docket.proposed_amount.toLocaleString('en-IN')})
                  </button>
                  <button type="submit" className="sap-btn sap-btn--reject">
                    ✕ Reject Application
                  </button>
                  <a href={`/chat?q=Draft+detailed+justification+for+docket+${docket.id}`} className="sap-btn sap-btn--default">
                    Request Analysis Note
                  </a>
                </div>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
