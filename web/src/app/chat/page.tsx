import { getCurrentUser } from '@/lib/session';

interface AgentResponse {
  finalOutput: string;
  route: string;
  guardsFired: string[];
  retrievedChunks: Array<{
    id: string;
    title: string;
    section: string;
    version: string;
    citation: string;
    content: string;
  }>;
  tokensIn: number;
  tokensOut: number;
  inrCost: number;
  latencyBreakdown: Record<string, number>;
  status: string;
}

async function sendQuery(query: string, userRole: string, studentId: string): Promise<AgentResponse | null> {
  if (!query) return null;
  try {
    const res = await fetch('http://localhost:4000/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: query,
        role: userRole,
        studentId,
      }),
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // API connection fallback
  }
  return null;
}

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const user = await getCurrentUser();
  const query = searchParams?.q || '';
  const response = query ? await sendQuery(query, user.role, user.id) : null;

  return (
    <div>
      <a href="/" className="govuk-link" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to Home
      </a>

      <h1 className="govuk-heading-xl">Ask Sahayata Assistant</h1>
      <p className="govuk-body-lead">
        Enquire about IIM Bodh Gaya financial aid policies, criteria, deadlines, and documentation.
        You may ask in English or Hinglish (e.g., <em>&quot;fees maaf hoti hai kya?&quot;</em>).
      </p>

      {/* Query Form (Pure HTML form - works without client JS) */}
      <form method="GET" action="/chat" style={{ marginBottom: '2rem' }}>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="q">
            What is your question?
          </label>
          <div className="govuk-hint">
            Every answer is verified against official policy documents and cites specific sections.
          </div>
          <textarea
            id="q"
            name="q"
            className="govuk-textarea"
            defaultValue={query}
            placeholder="Type your question here (e.g. What are the income limits for tuition waiver?)"
            required
          />
        </div>

        <button type="submit" className="govuk-button">
          Submit Enquiry
        </button>
      </form>

      {/* Suggested Enquiries */}
      {!response && (
        <div style={{ backgroundColor: '#f3f2f1', padding: '1.25rem', marginBottom: '2rem' }}>
          <h2 className="govuk-heading-m" style={{ marginTop: 0 }}>Sample Enquiries to Try</h2>
          <ul style={{ paddingLeft: '1.25rem', lineHeight: '1.8' }}>
            <li>
              <a href="/chat?q=What+are+the+eligibility+criteria+and+income+limits+for+Need+Based+Financial+Assistance?">
                What are the eligibility criteria and income limits for Need Based Financial Assistance?
              </a>
            </li>
            <li>
              <a href="/chat?q=fees+maaf+hoti+hai+kya%3F+What+is+the+procedure+in+Hindi%2FHinglish%3F">
                fees maaf hoti hai kya? What is the procedure? (Hinglish FAQ)
              </a>
            </li>
            <li>
              <a href="/chat?q=When+is+the+last+date+and+deadline+to+submit+documents%3F">
                When is the last date and deadline to submit documents? (Zero-Token FAQ)
              </a>
            </li>
            <li>
              <a href="/chat?q=My+Aadhaar+is+9876+5432+1098.+Am+I+eligible+for+Director+Merit+Scholarship+with+CGPA+8.8%3F">
                My Aadhaar is 9876 5432 1098. Am I eligible with CGPA 8.8? (PII Masking Test)
              </a>
            </li>
            <li>
              <a href="/chat?q=I+am+in+extreme+distress+and+cannot+survive+the+financial+burden">
                I am in extreme distress and cannot survive... (Counselling Triage Test)
              </a>
            </li>
          </ul>
        </div>
      )}

      {/* Response Box */}
      {response && (
        <div
          style={{
            border: '2px solid #00703c',
            backgroundColor: '#ffffff',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="govuk-tag govuk-tag--green">Verified Response</span>
            <span className="govuk-body-s" style={{ margin: 0 }}>
              Route: <strong>{response.route}</strong> | Cost: <strong>INR {response.inrCost.toFixed(4)}</strong>
            </span>
          </div>

          {/* Guard Warnings if any */}
          {response.guardsFired.length > 0 && (
            <div className="govuk-warning-text" style={{ marginBottom: '1rem' }}>
              <span className="govuk-warning-text__icon">!</span>
              <div>
                <strong>Guardrails Active for this interaction:</strong>
                <div className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
                  {response.guardsFired.join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Answer Text */}
          <div className="govuk-body" style={{ whiteSpace: 'pre-line', fontSize: '20px', lineHeight: '1.6' }}>
            {response.finalOutput}
          </div>

          {/* Where this comes from Details Expander */}
          {response.retrievedChunks && response.retrievedChunks.length > 0 && (
            <details className="govuk-details" style={{ marginTop: '1.5rem' }}>
              <summary className="govuk-details__summary">
                <span>Where this comes from ({response.retrievedChunks.length} official citations)</span>
              </summary>
              <div className="govuk-details__text">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {response.retrievedChunks.map((chunk, i) => (
                    <div key={chunk.id || i} style={{ borderBottom: '1px solid #b1b4b6', paddingBottom: '0.75rem' }}>
                      <p className="govuk-body-s" style={{ fontWeight: 'bold', color: '#005a30', margin: 0 }}>
                        {chunk.citation}
                      </p>
                      <p className="govuk-body-s" style={{ margin: '0.25rem 0 0 0', whiteSpace: 'pre-line' }}>
                        {chunk.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          )}

          <div className="govuk-button-group" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
            <a href="/chat" className="govuk-button govuk-button--secondary">
              Ask Another Question
            </a>
            <a href="/check-eligibility" className="govuk-button">
              Evaluate Scheme Eligibility
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
