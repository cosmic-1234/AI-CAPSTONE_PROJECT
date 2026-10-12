import { getCurrentUser } from '@/lib/session';

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
    const res = await fetch('http://localhost:4000/api/rag/search', {
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
      <a href="/" className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to Home
      </a>

      <h1 className="govuk-heading-xl">Knowledge Base & Policy Retrieval</h1>
      <p className="govuk-body-lead">
        Test hybrid retrieval (MiniSearch BM25 + dense semantic vectors with Reciprocal Rank Fusion)
        with role-based access control and low-confidence fallback.
      </p>

      {/* Search Form (Pure HTML GET form - works without JS) */}
      <form method="GET" action="/rag-preview" style={{ marginBottom: '2rem' }}>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="q">
            Enter Policy Query (English or Hinglish)
          </label>
          <div className="govuk-hint">
            Try: &quot;tuition fee waiver criteria&quot;, &quot;income certificate validity&quot;, &quot;merit scholarship CGPA&quot;, or &quot;fees maaf hoti hai kya?&quot;
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

        <button type="submit" className="govuk-button">
          Search Policies
        </button>
      </form>

      {/* Results Display */}
      {result && (
        <section aria-label="Search Results">
          <h2 className="govuk-heading-l">
            Results for: &ldquo;{result.query}&rdquo;
          </h2>

          {result.error && (
            <div className="govuk-error-summary" role="alert">
              <h3 className="govuk-error-summary__title">Retrieval Notice</h3>
              <p className="govuk-body">{result.error}</p>
            </div>
          )}

          {result.isLowConfidence && (
            <div className="govuk-warning-text" role="region" aria-label="Low confidence result">
              <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
              <div>
                <strong>Low Retrieval Confidence Guard Triggered:</strong>
                <p className="govuk-body" style={{ margin: '0.25rem 0 0 0' }}>
                  {result.fallbackMessage || 'I could not find this in the current documents. Please contact the Accounts Office (accounts@example.ac.in).'}
                </p>
              </div>
            </div>
          )}

          {result.chunks.length === 0 && !result.error && (
            <p className="govuk-body">No matching document chunks found under current ACL permissions.</p>
          )}

          {result.chunks.length > 0 && (
            <div>
              <p className="govuk-body-s">
                Showing top {result.chunks.length} chunks fused via Reciprocal Rank Fusion (RRF k=60):
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {result.chunks.map((chunk, idx) => (
                  <div
                    key={chunk.id}
                    style={{
                      border: '1px solid #b1b4b6',
                      padding: '1.25rem',
                      backgroundColor: '#ffffff',
                      borderLeft: '4px solid #00703c',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="govuk-tag govuk-tag--green">Rank #{idx + 1} (Score: {chunk.score.toFixed(4)})</span>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <span className="govuk-tag govuk-tag--grey">{chunk.accessLevel.toUpperCase()}</span>
                        <span className={`govuk-tag ${chunk.status === 'superseded' ? 'govuk-tag--red' : 'govuk-tag--green'}`}>
                          {chunk.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <h3 className="govuk-heading-m" style={{ marginTop: '0.5rem', marginBottom: '0.35rem' }}>
                      {chunk.title}
                    </h3>
                    
                    <p className="govuk-body-s" style={{ color: '#005a30', fontWeight: 'bold' }}>
                      Official Citation: &ldquo;{chunk.citation}&rdquo;
                    </p>

                    <div className="govuk-body" style={{ marginTop: '0.75rem', whiteSpace: 'pre-line' }}>
                      {chunk.content}
                    </div>

                    <details className="govuk-details" style={{ marginTop: '0.75rem' }}>
                      <summary className="govuk-details__summary">
                        <span>Where this comes from (Metadata Details)</span>
                      </summary>
                      <div className="govuk-details__text">
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          <li><strong>Document ID:</strong> {chunk.docId}</li>
                          <li><strong>Section:</strong> {chunk.section}</li>
                          <li><strong>Hierarchy:</strong> {chunk.headingHierarchy}</li>
                          <li><strong>Version:</strong> {chunk.version}</li>
                          <li><strong>Chunk ID:</strong> {chunk.id}</li>
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
