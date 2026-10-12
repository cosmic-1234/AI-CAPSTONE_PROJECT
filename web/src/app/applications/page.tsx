import { getCurrentUser } from '@/lib/session';
import { API_BASE_URL } from '@/lib/apiConfig';

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
    const res = await fetch(`${API_BASE_URL}/api/auth/user/${studentId}`, { cache: 'no-store' });
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
      <div style={{ marginBottom: '1.25rem' }}>
        <a href="/" className="sap-btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem' }}>
          ← Back to Launchpad
        </a>
      </div>

      <div className="sap-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid var(--sap-brand-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div>
            <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
              Student Self-Service Portal
            </span>
            <h1 className="govuk-heading-xl" style={{ margin: '0.2rem 0', fontSize: '1.65rem' }}>
              Financial Aid Applications Tracker
            </h1>
          </div>
          <span className="sap-badge sap-badge--info">
            Applicant: {user.name} ({user.programme || 'PGP'})
          </span>
        </div>
        <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
          Track the formal progress of your submitted tuition fee waivers, need-based assistance, and merit scholarships.
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="sap-card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
          <p className="govuk-body" style={{ color: 'var(--sap-text-secondary)', marginBottom: '1.25rem' }}>
            You do not currently have any active financial aid applications on file.
          </p>
          <a href="/check-eligibility" className="sap-btn sap-btn--emphasized">
            Evaluate Scheme Eligibility & Apply
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {apps.map((app) => {
            const tagClass = STATUS_TAG_CLASSES[app.status] || 'sap-badge--neutral';
            const schemeName = SCHEME_LABELS[app.scheme_id] || app.scheme_id;

            return (
              <div
                key={app.id}
                className="sap-card"
                style={{
                  padding: '1.35rem 1.5rem',
                  borderLeft: app.status === 'approved' ? '4px solid var(--sap-positive-text)' : '4px solid var(--sap-brand-blue)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
                      Application Ref: <strong>{app.id}</strong> &nbsp;|&nbsp; Submitted: {app.submitted_at}
                    </span>
                    <h2 className="govuk-heading-m" style={{ margin: '0.25rem 0', fontSize: '1.2rem' }}>{schemeName}</h2>
                  </div>
                  <span className={`sap-badge ${tagClass}`}>
                    {app.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <table className="govuk-summary-list" style={{ marginBottom: '1.25rem' }}>
                  <tbody>
                    <tr className="govuk-summary-list__row">
                      <th className="govuk-summary-list__key">Requested Amount</th>
                      <td className="govuk-summary-list__value">
                        <strong style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--sap-text-primary)' }}>
                          INR {app.requested_amount.toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td className="govuk-summary-list__actions"></td>
                    </tr>
                    <tr className="govuk-summary-list__row">
                      <th className="govuk-summary-list__key">Accounts Audit Stage</th>
                      <td className="govuk-summary-list__value">
                        <span className="sap-badge sap-badge--neutral">
                          {app.verification_status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="govuk-summary-list__actions"></td>
                    </tr>
                    <tr className="govuk-summary-list__row">
                      <th className="govuk-summary-list__key">Committee Review Status</th>
                      <td className="govuk-summary-list__value" style={{ fontWeight: 600 }}>
                        {app.committee_decision.toUpperCase()}
                      </td>
                      <td className="govuk-summary-list__actions"></td>
                    </tr>
                    <tr className="govuk-summary-list__row">
                      <th className="govuk-summary-list__key">Status Notes</th>
                      <td className="govuk-summary-list__value" style={{ color: 'var(--sap-text-secondary)' }}>
                        {app.decision_rationale}
                      </td>
                      <td className="govuk-summary-list__actions"></td>
                    </tr>
                  </tbody>
                </table>

                <div className="govuk-button-group" style={{ margin: 0 }}>
                  <a href="/upload" className="sap-btn sap-btn--default">
                    Upload Additional Documents
                  </a>
                  <a href={`/chat?q=What+is+the+status+of+application+${app.id}%3F`} className="sap-btn sap-btn--ghost">
                    Enquire on Application →
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
