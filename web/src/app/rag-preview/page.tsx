import { getCurrentUser } from '@/lib/session';
import { API_BASE_URL } from '@/lib/api';

interface RetrievedChunk {
  id: string;
  docId: string;
  title: string;
  section: string;
  version: string;
  status: 'current' | 'superseded';
  accessLevel: 'public' | 'staff' | 'committee';
  content: string;
  headingHierarchy: string;
  score: number;
  citation: string;
}

interface SearchResponse {
  query: string;
  chunks: RetrievedChunk[];
  isLowConfidence: boolean;
  fallbackMessage?: string;
  error?: string;
}

async function searchKnowledgeBase(query: string, role: string): Promise<SearchResponse | null> {
  if (!query) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, role, topK: 5 }),
      cache: 'no-store',
    });
    if (!res.ok) {
      return { query, chunks: [], isLowConfidence: true, error: `API error: ${res.statusText}` };
    }
    return await res.json();
  } catch (err: any) {
    return { query, chunks: [], isLowConfidence: true, error: `Could not connect to API server: ${err.message}` };
  }
}

export default async function RagPreviewPage({
  searchParams,
}: {
  searchParams?: { q?: string; role?: string };
}) {
  const user = await getCurrentUser();
  const query = searchParams?.q || '';
  const searchRole = searchParams?.role || user.role;

  const result = query ? await searchKnowledgeBase(query, searchRole) : null;

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
              Policy Knowledge Base
            </span>
            <h1 className="govuk-heading-xl" style={{ margin: '0.2rem 0', fontSize: '1.65rem' }}>
              Policy Documents &amp; Guidelines Search
            </h1>
          </div>
          <span className="sap-badge sap-badge--info">
            Access Role: {searchRole.toUpperCase()}
          </span>
        </div>
        <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
          Search institutional scholarship policies, procedural guidelines, and financial assistance rules
          according to authorized role access.
        </p>
      </div>

      {/* Search Form (Pure HTML GET form - works without JS) */}
      <div className="sap-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form method="GET" action="/rag-preview">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="q">
              Enter Policy Query
            </label>
            <div className="govuk-hint">
              Examples: &quot;tuition fee waiver criteria&quot;, &quot;income certificate validity&quot;, or &quot;merit scholarship CGPA&quot;
            </div>
            <input
              id="q"
              name="q"
              className="govuk-input"
              defaultValue={query}
              placeholder="Search financial aid policies..."
              style={{ maxWidth: '640px' }}
            />
          </div>

          <div className="govuk-form-group" style={{ maxWidth: '320px' }}>
            <label className="govuk-label" htmlFor="role">
              Query Role Perspective
            </label>
            <select id="role" name="role" className="govuk-select" defaultValue={searchRole}>
              <option value="student">Student (Public policies only)</option>
              <option value="staff">Staff / Accounts Officer (Includes SOPs)</option>
              <option value="committee">Aid Committee (Includes Charters)</option>
              <option value="admin">Administrator (All documents)</option>
            </select>
          </div>

          <button type="submit" className="sap-btn sap-btn--emphasized">
            Search Policy Documents
          </button>
        </form>
      </div>

      {/* Results Display */}
      {result && (
        <section aria-label="Search Results">
          <h2 className="govuk-heading-l" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            Relevant Policy Sections for: &ldquo;{result.query}&rdquo;
          </h2>

          {result.error && (
            <div className="govuk-error-summary" role="alert">
              <h3 className="govuk-error-summary__title">Notice</h3>
              <p className="govuk-body">{result.error}</p>
            </div>
          )}

          {result.isLowConfidence && (
            <div className="govuk-warning-text" role="region" aria-label="Low confidence result">
              <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
              <div>
                <strong>Policy Notice:</strong>
                <p className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
                  {result.fallbackMessage || 'I could not find this in the current documents. Please contact the Accounts Office (accounts@example.ac.in).'}
                </p>
              </div>
            </div>
          )}

          {result.chunks.length === 0 && !result.error && (
            <div className="sap-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
                No matching policy documents found under current permissions.
              </p>
            </div>
          )}

          {result.chunks.length > 0 && (
            <div>
              <p className="govuk-body-s" style={{ marginBottom: '1rem', color: 'var(--sap-text-secondary)' }}>
                Showing top {result.chunks.length} matching sections:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {result.chunks.map((chunk, idx) => (
                  <div
                    key={chunk.id}
                    className="sap-card"
                    style={{
                      padding: '1.35rem 1.5rem',
                      borderLeft: '4px solid var(--sap-positive-text)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className="sap-badge sap-badge--success">
                        Result #{idx + 1}
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <span className="sap-badge sap-badge--neutral">{chunk.accessLevel.toUpperCase()}</span>
                        <span className={`sap-badge ${chunk.status === 'superseded' ? 'sap-badge--error' : 'sap-badge--success'}`}>
                          {chunk.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <h3 className="govuk-heading-m" style={{ marginTop: '0.5rem', marginBottom: '0.35rem', fontSize: '1.2rem' }}>
                      {chunk.title}
                    </h3>
                    
                    <p className="govuk-body-s" style={{ color: 'var(--sap-positive-text)', fontWeight: 600 }}>
                      Official Citation: &ldquo;{chunk.citation}&rdquo;
                    </p>

                    <div className="govuk-body" style={{ marginTop: '0.75rem', whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.6', color: 'var(--sap-text-primary)' }}>
                      {chunk.content}
                    </div>

                    <details className="govuk-details" style={{ marginTop: '0.75rem', backgroundColor: '#f8fafd' }}>
                      <summary className="govuk-details__summary">
                        <span>Where this comes from (Metadata Details)</span>
                      </summary>
                      <div className="govuk-details__text">
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', lineHeight: '1.7' }}>
                          <li><strong>Document ID:</strong> {chunk.docId}</li>
                          <li><strong>Section:</strong> {chunk.section}</li>
                          <li><strong>Hierarchy:</strong> {chunk.headingHierarchy}</li>
                          <li><strong>Version:</strong> {chunk.version}</li>
                          <li><strong>Chunk ID:</strong> <code>{chunk.id}</code></li>
                        </ul>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
