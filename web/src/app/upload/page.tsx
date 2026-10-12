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
      <a href="/" className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to Home
      </a>

      <h1 className="govuk-heading-xl">Upload Supporting Documents</h1>
      <p className="govuk-body-lead">
        Submit all mandatory documentation required by the Accounts Office for income verification
        and committee consideration.
      </p>

      {/* Confirmation Banner if uploaded */}
      {isUploaded && (
        <div style={{ backgroundColor: '#00703c', color: '#ffffff', padding: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="govuk-heading-l" style={{ color: '#ffffff', margin: 0 }}>
            Document Uploaded Successfully
          </h2>
          <p className="govuk-body" style={{ color: '#ffffff', marginTop: '0.5rem', marginBottom: 0 }}>
            Your document has been stored in the secure institutional archive and forwarded for verification.
          </p>
        </div>
      )}

      {/* Task List Pattern */}
      <h2 className="govuk-heading-l">Application Checklist (4 Steps)</h2>
      <ul className="govuk-task-list">
        {TASKS.map((task) => (
          <li key={task.id} className="govuk-task-list__item">
            <div className="govuk-task-list__name-and-hint">
              <strong>{task.title}</strong>
              <div className="govuk-hint" style={{ margin: '0.25rem 0 0 0' }}>
                {task.hint}
              </div>
            </div>
            <div>
              <span className={`govuk-tag ${task.tagClass}`}>{task.status}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Upload Form (Pure HTML form + Server Action) */}
      <h2 className="govuk-heading-l">Submit a Document</h2>
      <form
        action={async (formData) => {
          'use server';
          await handleUpload(formData);
        }}
        method="POST"
        encType="multipart/form-data"
        style={{ border: '1px solid #b1b4b6', padding: '1.5rem', backgroundColor: '#ffffff', marginBottom: '2rem' }}
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
            Choose file from your device
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

        <button type="submit" className="govuk-button">
          Upload and Save Document
        </button>
      </form>

      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon">!</span>
        <div>
          <strong>Document Integrity Notice:</strong>
          <p className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
            Submission of inconsistent or tampered income figures (e.g., mismatch between declared income certificate and ITR return) will result in disciplinary hold and committee inquiry under Income Verification SOP §4.1.
          </p>
        </div>
      </div>
    </div>
  );
}
