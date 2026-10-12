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
      <a href="/" className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to Home
      </a>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <h1 className="govuk-heading-xl" style={{ margin: 0 }}>
          Financial Aid Committee Review Docket
        </h1>
        <span className="govuk-tag govuk-tag--grey">
          Member: {user.name} ({user.role.toUpperCase()})
        </span>
      </div>

      <p className="govuk-body-lead">
        Review synthesized recommendation notes, policy citations, and vote to grant or refuse financial awards.
      </p>

      {/* Decision confirmation message */}
      {actionTaken && (
        <div style={{ backgroundColor: '#cce2d8', borderLeft: '4px solid #00703c', padding: '1rem', marginBottom: '2rem' }}>
          <strong>Decision Recorded:</strong> Application action has been signed and logged to official audit register.
        </div>
      )}

      {/* Authority Notice */}
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon">!</span>
        <div>
          <strong>Constitutional Authority Guard (Guard F6):</strong>
          <p className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
            The AI agent is constitutionally restricted to advisory recommendations only. Binding legal commitments and disbursement mandates require the quorum approval of this Committee under Aid Committee Charter §3.2.
          </p>
        </div>
      </div>

      {/* Pending Dockets */}
      <h2 className="govuk-heading-l">Pending Committee Dockets ({DOCKETS.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
        {DOCKETS.map((docket) => (
          <div
            key={docket.id}
            style={{
              border: '2px solid #0b0c0c',
              padding: '1.75rem',
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <div>
                <span className="govuk-body-s" style={{ textTransform: 'uppercase', color: '#505a5f' }}>
                  Docket ID: <strong>{docket.id}</strong> | Student: <strong>{docket.applicant}</strong> ({docket.programme} {docket.batch})
                </span>
                <h3 className="govuk-heading-m" style={{ margin: '0.25rem 0' }}>{docket.scheme}</h3>
              </div>
              <span className="govuk-tag govuk-tag--yellow">PENDING COMMITTEE VOTE</span>
            </div>

            <table className="govuk-summary-list" style={{ marginBottom: '1.25rem' }}>
              <tbody>
                <tr className="govuk-summary-list__row">
                  <th className="govuk-summary-list__key">Family Income & Standing</th>
                  <td className="govuk-summary-list__value">
                    INR {docket.family_income.toLocaleString('en-IN')} / yr | CGPA: {docket.cgpa}
                  </td>
                  <td className="govuk-summary-list__actions"></td>
                </tr>
                <tr className="govuk-summary-list__row">
                  <th className="govuk-summary-list__key">Accounts Audit</th>
                  <td className="govuk-summary-list__value">
                    <span className="govuk-tag govuk-tag--green">{docket.accounts_verification}</span>
                  </td>
                  <td className="govuk-summary-list__actions"></td>
                </tr>
                <tr className="govuk-summary-list__row">
                  <th className="govuk-summary-list__key">Agent Recommendation</th>
                  <td className="govuk-summary-list__value">
                    {docket.recommendation_note}
                    <div style={{ marginTop: '0.5rem', color: '#005a30', fontWeight: 'bold' }}>
                      Citation: &ldquo;{docket.citation}&rdquo;
                    </div>
                  </td>
                  <td className="govuk-summary-list__actions"></td>
                </tr>
                <tr className="govuk-summary-list__row">
                  <th className="govuk-summary-list__key">Proposed Waiver Value</th>
                  <td className="govuk-summary-list__value">
                    <strong>INR {docket.proposed_amount.toLocaleString('en-IN')}</strong> ({docket.proposed_waiver})
                  </td>
                  <td className="govuk-summary-list__actions"></td>
                </tr>
              </tbody>
            </table>

            {/* Decision Action Form with Warning Text */}
            <div style={{ backgroundColor: '#f3f2f1', padding: '1.25rem', borderTop: '1px solid #b1b4b6' }}>
              <h4 className="govuk-heading-s" style={{ margin: 0 }}>Record Committee Decision</h4>
              <p className="govuk-body-s" style={{ marginTop: '0.25rem' }}>
                Approving this docket will authorize the Accounts Office to adjust the student tuition ledger and issue a verified award letter.
              </p>

              <form method="GET" action="/committee">
                <input type="hidden" name="action_taken" value={`approved_${docket.id}`} />
                <div className="govuk-button-group" style={{ margin: 0, marginTop: '0.75rem' }}>
                  <button type="submit" className="govuk-button">
                    Approve Award (INR {docket.proposed_amount.toLocaleString('en-IN')})
                  </button>
                  <button type="submit" className="govuk-button govuk-button--warning">
                    Reject Application
                  </button>
                  <a href={`/chat?q=Draft+detailed+justification+for+docket+${docket.id}`} className="govuk-button govuk-button--secondary">
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
