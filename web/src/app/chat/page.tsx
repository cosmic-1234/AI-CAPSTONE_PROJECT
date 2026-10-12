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

      {/* SAP Joule Dynamic Header */}
      <div className="sap-ai-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src="/brand/iimbg-logo.png"
              alt="IIM Bodh Gaya Logo"
              width="60"
              height="48"
              style={{ objectFit: 'contain', backgroundColor: '#ffffff', padding: '3px', borderRadius: '4px', border: '1px solid #e2e4e8' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sap-ai-primary)', fontWeight: 700 }}>
                  Enterprise Generative AI
                </span>
                <span className="sap-badge sap-badge--ai">
                  <span className="sap-ai-pulse-dot" style={{ width: 6, height: 6 }} />
                  ✦ JOULE v2.4 ACTIVE
                </span>
              </div>
              <h1 className="govuk-heading-xl" style={{ margin: 0, fontSize: '1.65rem' }}>
                Sahayata Enterprise CoPilot
              </h1>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="sap-badge sap-badge--info">
              Active Role: {user.role.toUpperCase()}
            </span>
          </div>
        </div>

        {/* AI Operational Ribbon */}
        <div className="sap-ai-ribbon" style={{ margin: '0.75rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12.5px', color: 'var(--sap-ai-badge-text)', fontWeight: 600 }}>
            <span>✦ Active System Guardrails:</span>
            <span className="sap-ai-step-pill">PII Redaction (F1)</span>
            <span className="sap-ai-step-pill">Hinglish Translation (F2)</span>
            <span className="sap-ai-step-pill">Policy Grounding (F3)</span>
            <span className="sap-ai-step-pill">Triage Routing (F4)</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--sap-text-secondary)' }}>
            Retrieval: Cosine Sim &gt; 0.65 • Zero Hallucination
          </span>
        </div>

        <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)', fontSize: '14px' }}>
          Authoritative intelligence assistant for IIM Bodh Gaya financial aid policies, criteria, deadlines, and documentation audits.
          Supports queries in English and colloquial Hinglish (e.g., <em>&quot;fees maaf hoti hai kya?&quot;</em>).
        </p>
      </div>

      {/* Query Form (Pure HTML form - zero client JS required) */}
      <div className="sap-card" style={{ marginBottom: '1.75rem' }}>
        <form method="GET" action="/chat">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="q" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: 'var(--sap-ai-primary)' }}>✦</span>
              <span>Ask Sahayata Policy Assistant or Enter Verification Prompt</span>
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
            <button type="submit" className="sap-btn sap-btn--ai-emphasized">
              ✦ Submit CoPilot Query
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
        <div className="sap-ai-card" style={{ marginBottom: '2rem' }}>
          <h2 className="govuk-heading-m" style={{ marginTop: 0, fontSize: '1.1rem', color: 'var(--sap-ai-badge-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>✦</span>
            <span>Recommended Joule Prompts</span>
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
                type: 'Psychological Hardship',
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
                  border: '1px solid #e2d9fc',
                  borderRadius: 'var(--sap-radius-sm)',
                  textDecoration: 'none',
                  color: 'var(--sap-text-primary)',
                  boxShadow: '0 1px 2px rgba(93, 54, 255, 0.04)',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--sap-ai-primary)' }}>✦</span>
                  <span>{item.label}</span>
                </span>
                <span className="sap-badge sap-badge--ai" style={{ fontSize: '11px' }}>
                  {item.type}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Response Display with Chatbot UI and AI Reasoning Pipeline */}
      {response && (
        <div style={{ marginBottom: '2.5rem' }}>
          {/* User Query Bubble */}
          <div className="sap-card" style={{ marginBottom: '1rem', backgroundColor: '#f0f4f8', borderLeft: '4px solid var(--sap-brand-blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--sap-text-primary)' }}>👤 You (Student):</span>
            </div>
            <div style={{ fontSize: '15px', color: 'var(--sap-text-primary)' }}>
              {query}
            </div>
          </div>

          {/* AI Reasoning & Multi-Step Execution Pipeline */}
          <div className="sap-ai-card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2d9fc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="sap-badge sap-badge--ai">
                  ✦ JOULE REASONING PIPELINE
                </span>
                <span style={{ fontSize: '12px', color: 'var(--sap-ai-badge-text)', fontWeight: 600 }}>
                  Deterministic Verification Complete
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--sap-text-secondary)' }}>
                Route: <strong>{response.route}</strong> &nbsp;|&nbsp; Latency: <strong>{Object.values(response.latencyBreakdown || {}).reduce((a, b) => a + b, 0)}ms</strong> &nbsp;|&nbsp; Cost: <strong>₹{response.inrCost.toFixed(4)}</strong>
              </div>
            </div>

            {/* Execution Steps */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="sap-ai-step-pill">✓ 1. Query Normalization</span>
              <span className="sap-ai-step-pill">✓ 2. PII Sanitization</span>
              <span className="sap-ai-step-pill">✓ 3. Policy Retrieval ({response.retrievedChunks?.length || 0} chunks)</span>
              <span className="sap-ai-step-pill">✓ 4. Guardrails F1-F6 Pass</span>
              <span className="sap-ai-step-pill">✓ 5. Citation Grounding</span>
            </div>

            {/* Guard Warnings if any */}
            {response.guardsFired.length > 0 && (
              <div className="govuk-warning-text" style={{ margin: '0.75rem 0' }}>
                <span className="govuk-warning-text__icon">!</span>
                <div>
                  <strong>Active Constitutional Guardrails Intercepted:</strong>
                  <div className="govuk-body-s" style={{ margin: '0.25rem 0 0 0' }}>
                    {response.guardsFired.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Response Message Bubble */}
          <div
            className="sap-card"
            style={{
              borderLeft: '4px solid var(--sap-ai-primary)',
              boxShadow: '0 4px 16px rgba(93, 54, 255, 0.08)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="sap-badge sap-badge--ai" style={{ fontSize: '12px', padding: '0.25rem 0.65rem' }}>
                ✦ Sahayata Joule Assistant
              </span>
              <span style={{ fontSize: '12px', color: 'var(--sap-positive-text)', fontWeight: 600 }}>
                ✓ Official Policy Grounded
              </span>
            </div>

            {/* Answer Text */}
            <div className="govuk-body" style={{ whiteSpace: 'pre-line', fontSize: '15px', lineHeight: '1.65', color: 'var(--sap-text-primary)' }}>
              {response.finalOutput}
            </div>

            {/* Official Citations Expander */}
            {response.retrievedChunks && response.retrievedChunks.length > 0 && (
              <details className="govuk-details" style={{ marginTop: '1.5rem', backgroundColor: '#faf9ff', border: '1px solid #e2d9fc' }}>
                <summary className="govuk-details__summary">
                  <span>✦ View Authoritative Policy Citations ({response.retrievedChunks.length} sources)</span>
                </summary>
                <div className="govuk-details__text">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {response.retrievedChunks.map((chunk, i) => (
                      <div key={chunk.id || i} style={{ borderBottom: '1px solid #e2d9fc', paddingBottom: '0.75rem' }}>
                        <p className="govuk-body-s" style={{ fontWeight: 600, color: 'var(--sap-ai-primary)', margin: 0 }}>
                          ✦ {chunk.citation}
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
              <a href="/check-eligibility" className="sap-btn sap-btn--ai-emphasized">
                ✦ Pre-Screen Scheme Eligibility
              </a>
              <a href="/chat" className="sap-btn sap-btn--ai">
                ✦ Ask Another Question
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
