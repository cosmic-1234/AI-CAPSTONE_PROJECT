import { API_BASE_URL } from '@/lib/apiConfig';

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
      <div style={{ marginBottom: '1.25rem' }}>
        <a href="/admin" className="sap-btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem' }}>
          ← Back to Admin Hub
        </a>
      </div>

      <div className="sap-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid var(--sap-brand-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div>
            <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
              Knowledge Management Engine
            </span>
            <h1 className="govuk-heading-xl" style={{ margin: '0.2rem 0', fontSize: '1.65rem' }}>
              Policy Manifest Registry
            </h1>
          </div>
          <form method="POST" action={`${API_BASE_URL}/api/rag/ingest`}>
            <button type="submit" className="sap-btn sap-btn--emphasized" style={{ margin: 0 }}>
              ↻ Trigger Embedding Pipeline
            </button>
          </form>
        </div>
        <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
          Audit indexed policy manifests, access levels (public vs staff vs committee), regulatory versions, and active vs superseded statuses.
        </p>
      </div>

      {/* SAP Responsive Data Table */}
      <table className="sap-table" style={{ marginTop: '1.25rem', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={{ width: '45%' }}>Document Identifier & Title</th>
            <th style={{ width: '18%' }}>Institutional Owner</th>
            <th style={{ width: '12%' }}>Version</th>
            <th style={{ width: '13%' }}>Access Level</th>
            <th style={{ width: '12%' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {MANIFEST_DOCS.map((doc) => (
            <tr key={doc.doc_id}>
              <td>
                <strong style={{ color: 'var(--sap-text-primary)' }}>[{doc.doc_id}] {doc.title}</strong>
                <div className="govuk-body-s" style={{ margin: '0.2rem 0 0 0', color: 'var(--sap-text-secondary)' }}>
                  {doc.description}
                </div>
              </td>
              <td style={{ color: 'var(--sap-text-secondary)' }}>{doc.owner}</td>
              <td style={{ fontVariantNumeric: 'tabular-nums' }}>{doc.version_date}</td>
              <td>
                <span className={`sap-badge ${doc.access_level === 'public' ? 'sap-badge--success' : doc.access_level === 'staff' ? 'sap-badge--warning' : 'sap-badge--neutral'}`}>
                  {doc.access_level.toUpperCase()}
                </span>
              </td>
              <td>
                <span className={`sap-badge ${doc.status === 'current' ? 'sap-badge--success' : 'sap-badge--error'}`}>
                  {doc.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="govuk-warning-text" style={{ marginBottom: '2rem' }}>
        <span className="govuk-warning-text__icon">!</span>
        <div>
          <strong>Document Supersession Guard (Guard F1 Enforced):</strong>
          <p className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
            Document <code>01a (Scholarship Policy 2025-26)</code> is deliberately kept in the repository to evaluate failure reproduction F1. When <code>enforce_current_policy_only</code> is enabled, chunks from 01a are excluded from retrieval results.
          </p>
        </div>
      </div>
    </div>
  );
}
