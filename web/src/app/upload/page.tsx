import fs from 'node:fs';
import path from 'node:path';
import { getCurrentUser } from '@/lib/session';

interface TaskItem {
  id: string;
  title: string;
  hint: string;
  status: 'COMPLETED' | 'CANNOT START YET' | 'IN PROGRESS';
  tagClass: string;
}

const TASKS: TaskItem[] = [
  {
    id: 't1',
    title: '1. Government Income Certificate',
    hint: 'Issued by competent revenue authority (Tehsildar/SDM) within the preceding 12 months.',
    status: 'COMPLETED',
    tagClass: 'govuk-tag--green',
  },
  {
    id: 't2',
    title: '2. Parent ITR-V Summary / Form 16',
    hint: 'Assessment Year 2026-27 filed with Income Tax Department for both parents.',
    status: 'IN PROGRESS',
    tagClass: 'govuk-tag--yellow',
  },
  {
    id: 't3',
    title: '3. Bank Account Statement (6 Months)',
    hint: 'Operative bank account showing regular family transactions and income credits.',
    status: 'IN PROGRESS',
    tagClass: 'govuk-tag--yellow',
  },
  {
    id: 't4',
    title: '4. Non-Judicial Stamp Affidavit',
    hint: 'Notarized affidavit declaring total family income and no external scholarship overlap.',
    status: 'CANNOT START YET',
    tagClass: 'govuk-tag--grey',
  },
];

async function handleUpload(formData: FormData) {
  'use server';
  const file = formData.get('documentFile') as File | null;
  const docType = formData.get('documentType') as string;

  if (file && file.size > 0) {
    const uploadDir = path.resolve(process.cwd(), '..', 'data', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sanitizedName = `${Date.now()}_${docType.replace(/[^a-zA-Z0-9]/g, '_')}_${file.name.replace(/[^a-zA-Z0-9\._-]/g, '')}`;
    fs.writeFileSync(path.join(uploadDir, sanitizedName), buffer);
  }
}

export default async function UploadPage({
  searchParams,
}: {
  searchParams?: { uploaded?: string };
}) {
  const user = await getCurrentUser();
  const isUploaded = searchParams?.uploaded === 'true';

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
              Accounts Verification Gateway
            </span>
            <h1 className="govuk-heading-xl" style={{ margin: '0.2rem 0', fontSize: '1.65rem' }}>
              Upload Supporting Documents
            </h1>
          </div>
          <span className="sap-badge sap-badge--info">
            Student: {user.name} ({user.programme || 'PGP'})
          </span>
        </div>
        <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
          Submit all mandatory documentation required by the Accounts Office for income verification
          and committee award determination.
        </p>
      </div>

      {/* Confirmation Banner if uploaded */}
      {isUploaded && (
        <div className="sap-card" style={{ backgroundColor: 'var(--sap-positive-bg)', border: '1px solid var(--sap-positive-border)', borderLeft: '4px solid var(--sap-positive-text)', padding: '1.25rem', marginBottom: '2rem' }}>
          <h2 className="govuk-heading-m" style={{ color: 'var(--sap-positive-text)', margin: 0, fontSize: '1.2rem' }}>
            ✓ Document Ingested Successfully
          </h2>
          <p className="govuk-body-s" style={{ color: 'var(--sap-positive-text)', marginTop: '0.35rem', marginBottom: 0 }}>
            Your document has been stored in the secure institutional archive and forwarded to the Accounts Office queue for cross-audit.
          </p>
        </div>
      )}

      {/* Task List Pattern */}
      <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Verification Checklist (4 Required Documents)
      </h2>
      <ul className="govuk-task-list" style={{ marginBottom: '2rem' }}>
        {TASKS.map((task) => (
          <li key={task.id} className="govuk-task-list__item">
            <div className="govuk-task-list__name-and-hint">
              <strong style={{ fontSize: '14px', color: 'var(--sap-text-primary)' }}>{task.title}</strong>
              <div className="govuk-hint" style={{ margin: '0.25rem 0 0 0', fontSize: '13px' }}>
                {task.hint}
              </div>
            </div>
            <div>
              <span className={`sap-badge ${task.status === 'COMPLETED' ? 'sap-badge--success' : task.status === 'IN PROGRESS' ? 'sap-badge--warning' : 'sap-badge--neutral'}`}>
                {task.status}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Upload Form (Pure HTML form + Server Action) */}
      <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Submit Verification Document
      </h2>
      <div className="sap-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form
          action={async (formData) => {
            'use server';
            await handleUpload(formData);
          }}
          method="POST"
          encType="multipart/form-data"
        >
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="documentType">
              Select Document Category
            </label>
            <select id="documentType" name="documentType" className="govuk-select" style={{ maxWidth: '480px' }} required>
              <option value="income_certificate">1. Government Income Certificate</option>
              <option value="itr_summary">2. Parent ITR-V Summary</option>
              <option value="bank_statement">3. Bank Account Statement (6 Months)</option>
              <option value="income_affidavit">4. Notarized Family Income Affidavit</option>
              <option value="merit_transcript">5. Term I Academic Transcript (for Merit)</option>
            </select>
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="documentFile">
              Select file from local device
            </label>
            <div className="govuk-hint">
              Accepted formats: PDF, DOCX, TXT (Maximum file size: 10MB)
            </div>
            <input
              id="documentFile"
              name="documentFile"
              type="file"
              className="govuk-input"
              style={{ padding: '0.4rem', maxWidth: '480px' }}
              required
            />
          </div>

          <button type="submit" className="sap-btn sap-btn--emphasized">
            Upload Document to Archive
          </button>
        </form>
      </div>

      <div className="govuk-warning-text" style={{ marginBottom: '2.5rem' }}>
        <span className="govuk-warning-text__icon">!</span>
        <div>
          <strong>Document Integrity Guardrail (Guard F15):</strong>
          <p className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
            Submission of inconsistent or tampered income figures (e.g., mismatch between declared income certificate and ITR return) will result in disciplinary hold and committee inquiry under Income Verification SOP §4.1.
          </p>
        </div>
      </div>
    </div>
  );
}
