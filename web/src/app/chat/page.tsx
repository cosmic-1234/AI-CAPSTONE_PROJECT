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
      <div style={{ marginBottom: '1.25rem' }}>
        <a href="/" className="sap-btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem' }}>
          ← Back to Launchpad
        </a>
      </div>

      <div className="sap-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid var(--sap-brand-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src="/brand/iimbg-logo.png"
              alt="IIM Bodh Gaya Logo"
              width="60"
              height="48"
              style={{ objectFit: 'contain' }}
            />
            <div>
              <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
                Institutional Advisory Assistant
              </span>
              <h1 className="govuk-heading-xl" style={{ margin: 0, fontSize: '1.65rem' }}>
                Sahayata Enterprise CoPilot
              </h1>
            </div>
          </div>
          <span className="sap-badge sap-badge--info">
            Session Role: {user.role.toUpperCase()}
          </span>
        </div>
        <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
          Authoritative intelligence assistant for IIM Bodh Gaya financial aid policies, criteria, deadlines, and documentation audits.
          Supports queries in English and colloquial Hinglish (e.g., <em>&quot;fees maaf hoti hai kya?&quot;</em>).
        </p>
      </div>

      {/* Query Form (Pure HTML form - zero client JS required) */}
      <div className="sap-card" style={{ marginBottom: '2rem' }}>
        <form method="GET" action="/chat">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="q">
              Enter Policy Query or Verification Prompt
            </label>
            <div className="govuk-hint">
              All responses are deterministically verified against approved IIM Bodh Gaya regulatory statutes with exact section citations.
            </div>
            <textarea
              id="q"
              name="q"
              className="govuk-textarea"
              defaultValue={query}
              placeholder="e.g. What are the income limits and eligibility thresholds for Tuition Fee Waiver?"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button type="submit" className="sap-btn sap-btn--emphasized">
              Submit CoPilot Enquiry
            </button>
            {query && (
              <a href="/chat" className="sap-btn sap-btn--default">
                Clear
              </a>
            )}
          </div>
        </form>
      </div>

      {/* Suggested Quick Prompts */}
      {!response && (
        <div className="sap-card" style={{ marginBottom: '2rem', backgroundColor: '#f8fafd' }}>
          <h2 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.1rem', color: 'var(--sap-text-primary)' }}>
            Recommended Enterprise Prompts
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              {
                label: 'What are the eligibility criteria and income limits for Need Based Financial Assistance?',
                type: 'Policy Inquiry',
              },
              {
                label: 'fees maaf hoti hai kya? What is the procedure in Hindi/Hinglish?',
                type: 'Hinglish NLP',
              },
              {
                label: 'When is the last date and deadline to submit documents?',
                type: 'Zero-Token FAQ',
              },
              {
                label: 'My Aadhaar is 9876 5432 1098. Am I eligible for Director Merit Scholarship with CGPA 8.8?',
                type: 'PII Redaction Guard',
              },
              {
                label: 'I am in extreme distress and cannot survive the financial burden',
                type: 'Psychological Triage',
              },
            ].map((item, idx) => (
              <a
                key={idx}
                href={`/chat?q=${encodeURIComponent(item.label)}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--sap-border-hairline)',
                  borderRadius: 'var(--sap-radius-sm)',
                  textDecoration: 'none',
                  color: 'var(--sap-text-primary)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'background-color 0.15s ease-in-out',
                }}
              >
                <span>{item.label}</span>
                <span className="govuk-tag govuk-tag--grey" style={{ fontSize: '11px' }}>
                  {item.type}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div
          className="sap-card"
          style={{
            borderLeft: '4px solid #107e3e',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--sap-border-hairline)' }}>
            <span className="govuk-tag govuk-tag--green">
              Verified Policy Synthesis
            </span>
            <div className="govuk-body-s" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
              Execution Route: <strong>{response.route}</strong> &nbsp;|&nbsp; Latency: <strong>{Object.values(response.latencyBreakdown || {}).reduce((a, b) => a + b, 0)}ms</strong> &nbsp;|&nbsp; Cost: <strong>₹{response.inrCost.toFixed(4)}</strong>
            </div>
          </div>

          {/* Guard Warnings if any */}
          {response.guardsFired.length > 0 && (
            <div className="govuk-warning-text" style={{ marginBottom: '1.25rem' }}>
              <span className="govuk-warning-text__icon">!</span>
              <div>
                <strong>Active Constitutional Guardrails Intercepted:</strong>
                <div className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
                  {response.guardsFired.join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Answer Text */}
          <div className="govuk-body" style={{ whiteSpace: 'pre-line', fontSize: '15px', lineHeight: '1.65', color: 'var(--sap-text-primary)' }}>
            {response.finalOutput}
          </div>

          {/* Official Citations Expander */}
          {response.retrievedChunks && response.retrievedChunks.length > 0 && (
            <details className="govuk-details" style={{ marginTop: '1.5rem', backgroundColor: '#f8fafd' }}>
              <summary className="govuk-details__summary">
                <span>View Authoritative Policy Citations ({response.retrievedChunks.length} sources)</span>
              </summary>
              <div className="govuk-details__text">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {response.retrievedChunks.map((chunk, i) => (
                    <div key={chunk.id || i} style={{ borderBottom: '1px solid var(--sap-border-hairline)', paddingBottom: '0.75rem' }}>
                      <p className="govuk-body-s" style={{ fontWeight: 600, color: 'var(--sap-positive-text)', margin: 0 }}>
                        {chunk.citation}
                      </p>
                      <p className="govuk-body-s" style={{ margin: '0.35rem 0 0 0', whiteSpace: 'pre-line', color: 'var(--sap-text-secondary)' }}>
                        {chunk.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          )}

          <div className="govuk-button-group" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
            <a href="/chat" className="sap-btn sap-btn--default">
              Ask Another Enquiry
            </a>
            <a href="/check-eligibility" className="sap-btn sap-btn--emphasized">
              Evaluate Scheme Eligibility
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
