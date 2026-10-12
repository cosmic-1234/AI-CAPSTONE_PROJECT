interface ManifestDoc {
  doc_id: string;
  title: string;
  owner: string;
  version_date: string;
  status: 'current' | 'superseded';
  access_level: 'public' | 'staff' | 'committee';
  refresh_date: string;
  description: string;
}

const MANIFEST_DOCS: ManifestDoc[] = [
  {
    doc_id: '01',
    title: 'Scholarship Policy 2026-27',
    owner: 'Aid Committee',
    version_date: '2026-27',
    status: 'current',
    access_level: 'public',
    refresh_date: '2026-08-01',
    description: 'Current baseline financial aid policy containing NBFA Tiers 1-3 rules and income slabs.',
  },
  {
    doc_id: '01a',
    title: 'Scholarship Policy 2025-26 (Superseded)',
    owner: 'Aid Committee',
    version_date: '2025-26',
    status: 'superseded',
    access_level: 'public',
    refresh_date: '2025-07-15',
    description: 'Deliberately left indexable to demonstrate failure F1 when hardening flag is disabled.',
  },
  {
    doc_id: '02',
    title: 'Fee Waiver Guidelines',
    owner: 'Accounts Office',
    version_date: '2026-27',
    status: 'current',
    access_level: 'public',
    refresh_date: '2026-08-10',
    description: 'Procedural guidelines for tuition fee waivers and installment adjustment applications.',
  },
  {
    doc_id: '03',
    title: 'Income Verification SOP',
    owner: 'Accounts & Audit',
    version_date: '2026-27',
    status: 'current',
    access_level: 'staff',
    refresh_date: '2026-08-15',
    description: 'Internal staff procedures for auditing revenue certificates, Tehsildar seals, and parent ITRs.',
  },
  {
    doc_id: '04',
    title: 'Merit Scholarship Rules',
    owner: 'Programme Office',
    version_date: '2026-27',
    status: 'current',
    access_level: 'public',
    refresh_date: '2026-07-20',
    description: 'Criteria for Director Merit awards based on Term I CGPA and percentile rankings.',
  },
  {
    doc_id: '05',
    title: 'Education Loan Guide',
    owner: 'Student Affairs',
    version_date: '2026-27',
    status: 'current',
    access_level: 'public',
    refresh_date: '2026-06-01',
    description: 'Guide to SBI Scholar Loan and partner bank education loan schemes for IIM Bodh Gaya.',
  },
  {
    doc_id: '06',
    title: 'Hardship & Emergency Fund Policy',
    owner: 'Aid Committee',
    version_date: '2026-27',
    status: 'current',
    access_level: 'public',
    refresh_date: '2026-08-05',
    description: 'Emergency assistance fund for sudden bereavement or medical crisis of earning parents.',
  },
  {
    doc_id: '07',
    title: 'Circular Oct-2026 Revision',
    owner: 'Dean Secretariat',
    version_date: '2026-27',
    status: 'current',
    access_level: 'public',
    refresh_date: '2026-10-02',
    description: 'Recent circular revising application deadlines and hostel fee installment schedules.',
  },
  {
    doc_id: '08',
    title: 'Student Handbook – Financial Section',
    owner: 'Dean Secretariat',
    version_date: '2026-27',
    status: 'current',
    access_level: 'public',
    refresh_date: '2026-07-01',
    description: 'Comprehensive student financial guidelines (contains pre-revision deadline references).',
  },
  {
    doc_id: '09',
    title: 'Document Checklist & Validity',
    owner: 'Accounts Office',
    version_date: '2026-27',
    status: 'current',
    access_level: 'public',
    refresh_date: '2026-08-01',
    description: 'Authoritative checklist specifying 12-month certificate validity and acceptable issuing authorities.',
  },
  {
    doc_id: '10',
    title: 'Aid Committee Charter & Delegation',
    owner: 'Board of Governors',
    version_date: '2026-27',
    status: 'current',
    access_level: 'committee',
    refresh_date: '2026-05-15',
    description: 'Internal governance charter establishing quorum, voting thresholds, and financial authority delegation.',
  },
  {
    doc_id: '11',
    title: 'Hinglish FAQ Glossary',
    owner: 'Student Helpdesk',
    version_date: '2026-27',
    status: 'current',
    access_level: 'public',
    refresh_date: '2026-08-20',
    description: 'Bilingual FAQ mapping colloquial Hinglish terminology to official financial aid rules.',
  },
  {
    doc_id: '12',
    title: 'Counselling & Wellbeing Referral',
    owner: 'Wellbeing Cell',
    version_date: '2026-27',
    status: 'current',
    access_level: 'public',
    refresh_date: '2026-08-01',
    description: 'Standard operating procedures for student distress crisis triage and counselling intervention.',
  },
];

export default function KnowledgeBaseManagerPage() {
  return (
    <div>
      <a href="/admin" className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to Admin Hub
      </a>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <h1 className="govuk-heading-xl" style={{ margin: 0 }}>
          Knowledge Base Manifest Manager
        </h1>
        <form method="POST" action="http://localhost:4000/api/rag/ingest">
          <button type="submit" className="govuk-button" style={{ margin: 0 }}>
            Re-Run Ingestion Pipeline
          </button>
        </form>
      </div>

      <p className="govuk-body-lead">
        Audit indexed policy manifests, access levels (public vs staff vs committee), versions, and status.
      </p>

      {/* Manifest Table */}
      <table className="govuk-summary-list" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #0b0c0c', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem 0.5rem' }}>Doc ID & Title</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Owner</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Version</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Access Level</th>
            <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {MANIFEST_DOCS.map((doc) => (
            <tr key={doc.doc_id} className="govuk-summary-list__row">
              <td style={{ padding: '0.85rem 0.5rem' }}>
                <strong>[{doc.doc_id}] {doc.title}</strong>
                <div className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
                  {doc.description}
                </div>
              </td>
              <td style={{ padding: '0.85rem 0.5rem' }}>{doc.owner}</td>
              <td style={{ padding: '0.85rem 0.5rem' }}>{doc.version_date}</td>
              <td style={{ padding: '0.85rem 0.5rem' }}>
                <span className={`govuk-tag ${doc.access_level === 'public' ? 'govuk-tag--green' : doc.access_level === 'staff' ? 'govuk-tag--yellow' : 'govuk-tag--grey'}`}>
                  {doc.access_level.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '0.85rem 0.5rem' }}>
                <span className={`govuk-tag ${doc.status === 'current' ? 'govuk-tag--green' : 'govuk-tag--red'}`}>
                  {doc.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon">!</span>
        <div>
          <strong>Document Supersession Note (Guard F1):</strong>
          <p className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
            Document <code>01a (Scholarship Policy 2025-26)</code> is deliberately kept in the repository to evaluate failure reproduction F1. When <code>enforce_current_policy_only</code> is enabled, chunks from 01a are excluded from retrieval results.
          </p>
        </div>
      </div>
    </div>
  );
}
