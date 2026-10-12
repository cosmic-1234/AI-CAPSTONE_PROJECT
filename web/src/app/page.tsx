import { getCurrentUser } from '@/lib/session';

interface Deadline {
  id: string;
  scheme: string;
  deadline_date: string;
  description: string;
}

const DEADLINES: Deadline[] = [
  {
    id: 'dl_need_based',
    scheme: 'Need-Based Financial Assistance (NBFA)',
    deadline_date: '31 October 2026',
    description: 'Submission of income certificates, parent ITRs, and family affidavit',
  },
  {
    id: 'dl_merit',
    scheme: "Director's Merit Scholarship (Term II)",
    deadline_date: '15 November 2026',
    description: 'Submission of Term I CGPA transcripts and conduct undertaking',
  },
  {
    id: 'dl_term_fee',
    scheme: 'Term-III Fee Installment Adjustment',
    deadline_date: '05 December 2026',
    description: 'Accounts office fee installment postponement requests',
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="govuk-heading-xl">Sahayata – Financial Aid Desk</h1>
      <p className="govuk-body-lead">
        Welcome back, <strong>{user.name}</strong>. Access official IIM Bodh Gaya financial aid policies,
        check scheme eligibility, track applications, and resolve fee waiver queries.
      </p>

      {/* Student Profile Summary (if student) */}
      {user.role === 'student' && (
        <>
          <h2 className="govuk-heading-l">Your Academic & Profile Overview</h2>
          <table className="govuk-summary-list">
            <tbody>
              <tr className="govuk-summary-list__row">
                <th className="govuk-summary-list__key">Programme & Batch</th>
                <td className="govuk-summary-list__value">
                  {user.programme || 'PGP'} ({user.batch || '2025-27'})
                </td>
                <td className="govuk-summary-list__actions">
                  <a href="/login">Change</a>
                </td>
              </tr>
              <tr className="govuk-summary-list__row">
                <th className="govuk-summary-list__key">Reported Family Income</th>
                <td className="govuk-summary-list__value">
                  INR {user.annual_family_income?.toLocaleString('en-IN') || '2,40,000'} / year
                </td>
                <td className="govuk-summary-list__actions">
                  <span className="govuk-tag govuk-tag--green">Self-Declared</span>
                </td>
              </tr>
              <tr className="govuk-summary-list__row">
                <th className="govuk-summary-list__key">Current CGPA</th>
                <td className="govuk-summary-list__value">{user.cgpa || 7.8} / 10.0</td>
                <td className="govuk-summary-list__actions">
                  <span className="govuk-tag govuk-tag--grey">Verified Term 1</span>
                </td>
              </tr>
              <tr className="govuk-summary-list__row">
                <th className="govuk-summary-list__key">Category</th>
                <td className="govuk-summary-list__value">{user.category || 'General'}</td>
                <td className="govuk-summary-list__actions"></td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {/* Deadlines Section */}
      <h2 className="govuk-heading-l">Upcoming Important Deadlines</h2>
      <div className="govuk-grid-row">
        {DEADLINES.map((dl) => (
          <div key={dl.id} className="govuk-card govuk-card--highlight">
            <span className="govuk-tag govuk-tag--yellow">Due {dl.deadline_date}</span>
            <h3 className="govuk-heading-m" style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
              {dl.scheme}
            </h3>
            <p className="govuk-body-s">{dl.description}</p>
          </div>
        ))}
      </div>

      {/* Primary Actions Grid */}
      <h2 className="govuk-heading-l">Desk Services</h2>
      <div className="govuk-grid-row">
        <div className="govuk-card">
          <h3 className="govuk-heading-m" style={{ marginTop: 0 }}>
            Policy & FAQ Search
          </h3>
          <p className="govuk-body">
            Search institute scholarship policies, fee waiver guidelines, circulars, and SOPs.
          </p>
          <a href="/rag-preview" className="govuk-button govuk-button--secondary">
            Search Knowledge Base
          </a>
        </div>

        <div className="govuk-card">
          <h3 className="govuk-heading-m" style={{ marginTop: 0 }}>
            Check Aid Eligibility
          </h3>
          <p className="govuk-body">
            Step-by-step questionnaire to evaluate your eligibility across NBFA, Merit, and Emergency funds.
          </p>
          <a href="/check-eligibility" className="govuk-button">
            Check Eligibility
          </a>
        </div>

        <div className="govuk-card">
          <h3 className="govuk-heading-m" style={{ marginTop: 0 }}>
            Ask Assistant
          </h3>
          <p className="govuk-body">
            Ask queries in English or Hinglish with citations to official institute documents.
          </p>
          <a href="/chat" className="govuk-button">
            Start Enquiry
          </a>
        </div>
      </div>

      {/* Staff & Admin Specific Actions */}
      {(user.role === 'staff' || user.role === 'committee' || user.role === 'admin') && (
        <>
          <h2 className="govuk-heading-l">Administrative Actions</h2>
          <div className="govuk-grid-row">
            {user.role === 'staff' && (
              <div className="govuk-card">
                <h3 className="govuk-heading-m" style={{ marginTop: 0 }}>Accounts Queue</h3>
                <p className="govuk-body">Verify submitted income certificates and cross-check ITR summaries.</p>
                <a href="/accounts" className="govuk-button">Open Accounts Queue</a>
              </div>
            )}
            {user.role === 'committee' && (
              <div className="govuk-card">
                <h3 className="govuk-heading-m" style={{ marginTop: 0 }}>Committee Review</h3>
                <p className="govuk-body">Review agent recommendation notes and record approval/rejections.</p>
                <a href="/committee" className="govuk-button">Open Review Docket</a>
              </div>
            )}
            {user.role === 'admin' && (
              <div className="govuk-card">
                <h3 className="govuk-heading-m" style={{ marginTop: 0 }}>Observability & Red-Team</h3>
                <p className="govuk-body">Inspect execution traces, evaluation metrics, and toggle hardening switches.</p>
                <a href="/admin" className="govuk-button">Open Admin Hub</a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
