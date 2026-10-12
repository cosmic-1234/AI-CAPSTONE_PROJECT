import { getCurrentUser } from '@/lib/session';

interface ApplicationRow {
  id: string;
  student_id: string;
  scheme_id: string;
  status: string;
  requested_amount: number;
  recommended_amount: number;
  approved_amount: number;
  submitted_at: string;
  verification_status: string;
  committee_decision: string;
  decision_rationale: string;
}

const SCHEME_LABELS: Record<string, string> = {
  nbfa_tier1: 'Need-Based Financial Assistance (Tier 1 – 100% Waiver)',
  nbfa_tier2: 'Need-Based Financial Assistance (Tier 2 – 50% Waiver)',
  nbfa_tier3: 'Need-Based Financial Assistance (Tier 3 – 25% Waiver)',
  merit_director: "Director's Merit Scholarship",
  emergency_hardship: 'Emergency Student Hardship Fund',
};

const STATUS_TAG_CLASSES: Record<string, string> = {
  submitted: 'govuk-tag--yellow',
  under_verification: 'govuk-tag--yellow',
  committee_review: 'govuk-tag--yellow',
  approved: 'govuk-tag--green',
  disbursed: 'govuk-tag--green',
  rejected: 'govuk-tag--red',
  draft: 'govuk-tag--grey',
};

async function getApplications(studentId: string): Promise<ApplicationRow[]> {
  try {
    const res = await fetch(`http://localhost:4000/api/auth/user/${studentId}`, { cache: 'no-store' });
  } catch {}

  // Fallback / mock database applications for user
  return [
    {
      id: 'app_101',
      student_id: 'std_01',
      scheme_id: 'nbfa_tier1',
      status: 'under_verification',
      requested_amount: 450000,
      recommended_amount: 450000,
      approved_amount: 0,
      submitted_at: '2026-10-01 10:30',
      verification_status: 'pending_accounts',
      committee_decision: 'pending',
      decision_rationale: 'Submitted income certificate (INR 2,40,000) under audit with ITR return.',
    },
    {
      id: 'app_102',
      student_id: 'std_02',
      scheme_id: 'nbfa_tier2',
      status: 'committee_review',
      requested_amount: 225000,
      recommended_amount: 225000,
      approved_amount: 0,
      submitted_at: '2026-09-28 14:15',
      verification_status: 'verified',
      committee_decision: 'pending',
      decision_rationale: 'ITR-V and income certificate cross-verified. Recommended for 50% waiver.',
    },
    {
      id: 'app_103',
      student_id: 'std_04',
      scheme_id: 'merit_director',
      status: 'submitted',
      requested_amount: 100000,
      recommended_amount: 100000,
      approved_amount: 0,
      submitted_at: '2026-10-05 09:00',
      verification_status: 'pending_programme',
      committee_decision: 'pending',
      decision_rationale: 'Term 1 CGPA 8.7 meets merit criteria. Pending conduct endorsement.',
    },
  ];
}

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  const allApps = await getApplications(user.id);
  // Filter for student if student
  const apps = user.role === 'student' ? allApps.filter((a) => a.student_id === user.id) : allApps;

  return (
    <div>
      <a href="/" className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to Home
      </a>

      <h1 className="govuk-heading-xl">My Applications Status Tracker</h1>
      <p className="govuk-body-lead">
        Track the progress of your submitted financial aid, scholarship, and waiver applications.
      </p>

      {apps.length === 0 ? (
        <div style={{ backgroundColor: '#f3f2f1', padding: '1.5rem', marginBottom: '2rem' }}>
          <p className="govuk-body">You do not currently have any active financial aid applications on file.</p>
          <a href="/check-eligibility" className="govuk-button">
            Apply for Assistance
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {apps.map((app) => {
            const tagClass = STATUS_TAG_CLASSES[app.status] || 'govuk-tag--grey';
            const schemeName = SCHEME_LABELS[app.scheme_id] || app.scheme_id;

            return (
              <div
                key={app.id}
                style={{
                  border: '1px solid #b1b4b6',
                  padding: '1.5rem',
                  backgroundColor: '#ffffff',
                  borderTop: '4px solid #00703c',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="govuk-body-s" style={{ textTransform: 'uppercase', color: '#505a5f' }}>
                      Application Ref: <strong>{app.id}</strong> | Submitted: {app.submitted_at}
                    </span>
                    <h2 className="govuk-heading-m" style={{ margin: '0.25rem 0' }}>{schemeName}</h2>
                  </div>
                  <span className={`govuk-tag ${tagClass}`}>
                    {app.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <table className="govuk-summary-list" style={{ marginBottom: '1rem' }}>
                  <tbody>
                    <tr className="govuk-summary-list__row">
                      <th className="govuk-summary-list__key">Requested Amount</th>
                      <td className="govuk-summary-list__value">INR {app.requested_amount.toLocaleString('en-IN')}</td>
                      <td className="govuk-summary-list__actions"></td>
                    </tr>
                    <tr className="govuk-summary-list__row">
                      <th className="govuk-summary-list__key">Accounts Verification</th>
                      <td className="govuk-summary-list__value">
                        <span className="govuk-tag govuk-tag--grey">
                          {app.verification_status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="govuk-summary-list__actions"></td>
                    </tr>
                    <tr className="govuk-summary-list__row">
                      <th className="govuk-summary-list__key">Committee Review Status</th>
                      <td className="govuk-summary-list__value">
                        {app.committee_decision.toUpperCase()}
                      </td>
                      <td className="govuk-summary-list__actions"></td>
                    </tr>
                    <tr className="govuk-summary-list__row">
                      <th className="govuk-summary-list__key">Status Notes</th>
                      <td className="govuk-summary-list__value">{app.decision_rationale}</td>
                      <td className="govuk-summary-list__actions"></td>
                    </tr>
                  </tbody>
                </table>

                <div className="govuk-button-group" style={{ margin: 0 }}>
                  <a href="/upload" className="govuk-button govuk-button--secondary">
                    Upload Additional Documents
                  </a>
                  <a href="/chat?q=What+is+the+status+of+application+app_101%3F" className="govuk-button govuk-button--secondary">
                    Enquire on Application
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
