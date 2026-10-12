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
      {/* SAP Fiori Object Page Header */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #d9dcdf',
          borderRadius: '8px',
          padding: '1.5rem 1.75rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(28, 45, 66, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src="/brand/iimbg-logo.png"
              alt="IIM Bodh Gaya Logo"
              width="68"
              height="54"
              style={{ objectFit: 'contain', backgroundColor: '#ffffff', padding: '2px' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <h1 className="govuk-heading-xl" style={{ margin: 0, fontSize: '1.75rem' }}>
                  {user.name}
                </h1>
                <span className="sap-badge sap-badge--success">
                  {user.role.toUpperCase()}
                </span>
              </div>
              <p className="govuk-body-s" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
                {user.programme || 'Executive'} ({user.batch || 'Current Batch'}) &bull; {user.email}
              </p>
            </div>
          </div>

          <a href="/login" className="sap-btn sap-btn--default" style={{ padding: '0.45rem 0.95rem', fontSize: '13px' }}>
            Switch Persona
          </a>
        </div>

        {/* Compact 3-Column Metadata Strip (SAP Object Header Pattern) */}
        {user.role === 'student' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #e8ebef',
            }}
          >
            <div>
              <span className="govuk-body-s" style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                Reported Family Income
              </span>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#1c2d42', marginTop: '0.15rem' }}>
                ₹ {user.annual_family_income?.toLocaleString('en-IN') || '2,40,000'} <span style={{ fontSize: '12px', fontWeight: '400', color: '#556b82' }}>/ year</span>
              </div>
            </div>

            <div>
              <span className="govuk-body-s" style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                Academic Cumulative CGPA
              </span>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#107e3e', marginTop: '0.15rem' }}>
                {user.cgpa || 7.8} <span style={{ fontSize: '12px', fontWeight: '400', color: '#556b82' }}>/ 10.0 (Term 1)</span>
              </div>
            </div>

            <div>
              <span className="govuk-body-s" style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                Social Category
              </span>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#1c2d42', marginTop: '0.15rem' }}>
                {user.category || 'General'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deadlines Section (SAP KPI Launchpad Tiles) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h2 className="govuk-heading-l" style={{ margin: 0, fontSize: '1.25rem' }}>Upcoming Critical Deadlines</h2>
        <span className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)' }}>Academic Year 2026-27</span>
      </div>

      <div className="govuk-grid-row">
        {DEADLINES.map((dl) => (
          <div key={dl.id} className="sap-card" style={{ borderTop: '3px solid #b78103' }}>
            <div>
              <span className="sap-badge sap-badge--warning" style={{ fontSize: '11px' }}>
                Due: {dl.deadline_date}
              </span>
              <h3 className="govuk-heading-m" style={{ marginTop: '0.65rem', marginBottom: '0.35rem', fontSize: '1.15rem' }}>
                {dl.scheme}
              </h3>
              <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)', margin: 0 }}>{dl.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Actions Grid (SAP Launchpad Workspaces) */}
      <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Desk Workspaces & Services</h2>
      <div className="govuk-grid-row">
        <div className="sap-card">
          <div>
            <span className="sap-badge sap-badge--neutral" style={{ fontSize: '11px' }}>EXPLORATION</span>
            <h3 className="govuk-heading-m" style={{ marginTop: '0.65rem', marginBottom: '0.35rem', fontSize: '1.15rem' }}>
              Policy & FAQ Search
            </h3>
            <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)' }}>
              Search official IIM Bodh Gaya financial aid policies, fee waiver guidelines, circulars, and SOPs.
            </p>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <a href="/rag-preview" className="sap-btn sap-btn--default" style={{ width: '100%' }}>
              Search Knowledge Base →
            </a>
          </div>
        </div>

        <div className="sap-card">
          <div>
            <span className="sap-badge sap-badge--neutral" style={{ fontSize: '11px' }}>RULES ENGINE</span>
            <h3 className="govuk-heading-m" style={{ marginTop: '0.65rem', marginBottom: '0.35rem', fontSize: '1.15rem' }}>
              Check Aid Eligibility
            </h3>
            <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)' }}>
              Step-by-step questionnaire evaluating your eligibility across NBFA, Merit, and Emergency funds.
            </p>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <a href="/check-eligibility" className="sap-btn sap-btn--emphasized" style={{ width: '100%' }}>
              Evaluate Eligibility →
            </a>
          </div>
        </div>

        <div className="sap-card">
          <div>
            <span className="sap-badge sap-badge--info" style={{ fontSize: '11px' }}>AI COPILOT</span>
            <h3 className="govuk-heading-m" style={{ marginTop: '0.65rem', marginBottom: '0.35rem', fontSize: '1.15rem' }}>
              Ask Sahayata Assistant
            </h3>
            <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)' }}>
              Ask queries in English or Hinglish with verified citations to official institute regulatory documents.
            </p>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <a href="/chat" className="sap-btn sap-btn--emphasized" style={{ width: '100%' }}>
              Launch CoPilot →
            </a>
          </div>
        </div>
      </div>

      {/* Staff & Admin Specific Actions */}
      {(user.role === 'staff' || user.role === 'committee' || user.role === 'admin') && (
        <>
          <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Administrative Worklists</h2>
          <div className="govuk-grid-row">
            {user.role === 'staff' && (
              <div className="sap-card" style={{ borderLeft: '4px solid var(--sap-brand-blue)' }}>
                <div>
                  <span className="sap-badge sap-badge--warning" style={{ fontSize: '11px' }}>VERIFICATION</span>
                  <h3 className="govuk-heading-m" style={{ marginTop: '0.65rem', marginBottom: '0.35rem', fontSize: '1.15rem' }}>Accounts Queue</h3>
                  <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)' }}>Verify submitted income certificates and cross-check parent ITR summaries.</p>
                </div>
                <div style={{ marginTop: '1.25rem' }}>
                  <a href="/accounts" className="sap-btn sap-btn--default" style={{ width: '100%' }}>Open Accounts Queue →</a>
                </div>
              </div>
            )}
            {user.role === 'committee' && (
              <div className="sap-card" style={{ borderLeft: '4px solid #b78103' }}>
                <div>
                  <span className="sap-badge sap-badge--warning" style={{ fontSize: '11px' }}>GOVERNANCE</span>
                  <h3 className="govuk-heading-m" style={{ marginTop: '0.65rem', marginBottom: '0.35rem', fontSize: '1.15rem' }}>Committee Review</h3>
                  <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)' }}>Review agent recommendation notes and record formal votes.</p>
                </div>
                <div style={{ marginTop: '1.25rem' }}>
                  <a href="/committee" className="sap-btn sap-btn--default" style={{ width: '100%' }}>Open Review Docket →</a>
                </div>
              </div>
            )}
            {user.role === 'admin' && (
              <div className="sap-card" style={{ borderLeft: '4px solid #bb0000' }}>
                <div>
                  <span className="sap-badge sap-badge--error" style={{ fontSize: '11px' }}>SYSTEM CONTROL</span>
                  <h3 className="govuk-heading-m" style={{ marginTop: '0.65rem', marginBottom: '0.35rem', fontSize: '1.15rem' }}>Observability & Red-Team</h3>
                  <p className="govuk-body-s" style={{ color: 'var(--sap-text-secondary)' }}>Inspect execution traces, evaluation metrics, and toggle hardening switches.</p>
                </div>
                <div style={{ marginTop: '1.25rem' }}>
                  <a href="/admin" className="sap-btn sap-btn--default" style={{ width: '100%' }}>Open Admin Hub →</a>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
