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
  const totalMs = Object.values(response?.latencyBreakdown || {}).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" className="sap-btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem' }}>
          ← Back to Launchpad
        </a>
        <span className="sap-badge sap-badge--info">
          Session Persona: {user.name} ({user.role.toUpperCase()})
        </span>
      </div>

      {/* Main Conversational Chatbot Window */}
      <div className="sap-chat-window" role="region" aria-label="Sahayata AI Chatbot">
        {/* Chatbot Header */}
        <div className="sap-chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img
              src="/brand/iimbg-logo.png"
              alt="IIM Bodh Gaya Logo"
              width="44"
              height="34"
              style={{ objectFit: 'contain', backgroundColor: '#ffffff', padding: '2px', borderRadius: '4px' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ fontSize: '15px', color: '#ffffff' }}>Sahayata Enterprise CoPilot</strong>
                <span className="sap-badge sap-badge--ai" style={{ fontSize: '10px', padding: '0.15rem 0.45rem' }}>
                  <span className="sap-ai-pulse-dot" style={{ width: 5, height: 5 }} />
                  ✦ JOULE ACTIVE
                </span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#c4b5fd' }}>
                IIM Bodh Gaya Policy Intelligence &bull; Deterministic Guardrails F1&ndash;F6 Active
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {query && (
              <a href="/chat" className="sap-btn--ghost" style={{ color: '#ffffff', fontSize: '12px', padding: '0.3rem 0.65rem', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '4px' }}>
                ✦ New Chat
              </a>
            )}
          </div>
        </div>

        {/* Guardrail Transparency Ribbon */}
        <div className="sap-ai-ribbon" style={{ margin: 0, borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '0.55rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', color: 'var(--sap-ai-badge-text)', fontWeight: 600 }}>
            <span>✦ Active System Guardrails:</span>
            <span className="sap-ai-step-pill">PII Redaction (F1)</span>
            <span className="sap-ai-step-pill">Hinglish NLP (F2)</span>
            <span className="sap-ai-step-pill">Policy Grounding (F3)</span>
            <span className="sap-ai-step-pill">Triage Routing (F4)</span>
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--sap-text-secondary)' }}>
            Retrieval: Cosine Sim &gt; 0.65 &bull; 100% Policy Grounded
          </span>
        </div>

        {/* Chat Message Stream */}
        <div className="sap-chat-messages" id="chat-messages">
          {/* 1. Assistant Greeting / Welcome Bubble (Always Present) */}
          <div className="sap-chat-msg--bot">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <span className="sap-badge sap-badge--ai" style={{ fontSize: '11px', padding: '0.15rem 0.5rem' }}>
                ✦ Sahayata Copilot
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--sap-text-secondary)' }}>
                Official Institute Advisory Desk
              </span>
            </div>
            <div className="sap-chat-bubble">
              <p style={{ margin: 0, lineHeight: 1.55 }}>
                Namaste <strong>{user.name}</strong>! I am <strong>Sahayata</strong>, your AI Financial Aid Assistant at IIM Bodh Gaya.
              </p>
              <p style={{ margin: '0.5rem 0 0 0', lineHeight: 1.55, color: 'var(--sap-text-secondary)', fontSize: '14px' }}>
                I provide authoritative answers deterministically verified against approved institute statutes. How can I help you today?
              </p>
              <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0, fontSize: '13.5px', color: 'var(--sap-text-secondary)' }}>
                <li><strong>Need-Based Financial Assistance (NBFA):</strong> Up to 100% tuition waiver for family income &le; ₹3.0L.</li>
                <li><strong>Director&apos;s Merit Scholarship:</strong> Merit awards for top 10% academic standing.</li>
                <li><strong>Document Compliance:</strong> 12-month validity for Income Certificates &amp; Parent ITR-V cross-audit rules.</li>
                <li><strong>Education Loans:</strong> Pre-approved SBI Scholar Loan terms and interest subsidy schemes.</li>
              </ul>
            </div>
          </div>

          {/* 2. User Message Bubble (Appears when query is submitted) */}
          {query && (
            <div className="sap-chat-msg--user">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
                  👤 You ({user.name})
                </span>
              </div>
              <div className="sap-chat-bubble">
                {query}
              </div>
            </div>
          )}

          {/* 3. Assistant Response Bubble (Appears right after user message) */}
          {response && (
            <div className="sap-chat-msg--bot">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                <span className="sap-badge sap-badge--ai" style={{ fontSize: '11px', padding: '0.15rem 0.5rem' }}>
                  ✦ Sahayata Joule Assistant
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--sap-positive-text)', fontWeight: 600 }}>
                  ✓ Policy Grounded &bull; Route: {response.route} &bull; {totalMs}ms &bull; ₹{response.inrCost.toFixed(4)}
                </span>
              </div>

              <div className="sap-chat-bubble">
                {/* Active Guard Interception Warning */}
                {response.guardsFired.length > 0 && (
                  <div className="govuk-warning-text" style={{ margin: '0 0 0.85rem 0', padding: '0.5rem 0.75rem', backgroundColor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '4px' }}>
                    <span className="govuk-warning-text__icon" style={{ fontSize: '14px', width: '22px', height: '22px', lineHeight: '20px' }}>!</span>
                    <div style={{ fontSize: '12px' }}>
                      <strong>Constitutional Guardrail Intercepted:</strong> {response.guardsFired.join(', ')}
                    </div>
                  </div>
                )}

                {/* Formatted Answer Output */}
                <div style={{ whiteSpace: 'pre-line', fontSize: '15px', lineHeight: '1.65', color: 'var(--sap-text-primary)' }}>
                  {response.finalOutput}
                </div>

                {/* Authoritative Policy Citations Accordion */}
                {response.retrievedChunks && response.retrievedChunks.length > 0 && (
                  <details className="govuk-details" style={{ marginTop: '1.25rem', backgroundColor: '#faf9ff', border: '1px solid #e2d9fc', borderRadius: '4px' }}>
                    <summary className="govuk-details__summary" style={{ fontSize: '13px' }}>
                      <span>✦ View Authoritative Policy Citations ({response.retrievedChunks.length} sources)</span>
                    </summary>
                    <div className="govuk-details__text" style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {response.retrievedChunks.map((chunk, i) => (
                          <div key={chunk.id || i} style={{ borderBottom: '1px solid #e2d9fc', paddingBottom: '0.5rem' }}>
                            <p className="govuk-body-s" style={{ fontWeight: 600, color: 'var(--sap-ai-primary)', margin: 0 }}>
                              ✦ {chunk.citation}
                            </p>
                            <p className="govuk-body-s" style={{ margin: '0.25rem 0 0 0', whiteSpace: 'pre-line', color: 'var(--sap-text-secondary)', fontSize: '12.5px' }}>
                              {chunk.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                )}

                {/* Follow-up Action Buttons inside the bot message */}
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.15rem', flexWrap: 'wrap' }}>
                  <a href="/check-eligibility" className="sap-btn sap-btn--ai-emphasized" style={{ fontSize: '12.5px', padding: '0.35rem 0.85rem' }}>
                    ✦ Pre-Screen Scheme Eligibility
                  </a>
                  <a href="/upload" className="sap-btn sap-btn--ai" style={{ fontSize: '12.5px', padding: '0.35rem 0.85rem' }}>
                    ✦ Check Document Checklist
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips (Positioned right above the bottom input bar!) */}
        <div className="sap-chat-chips-bar" aria-label="Suggested Prompts">
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--sap-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0 }}>
            Suggested:
          </span>
          <a href="/chat?q=What%20are%20the%20eligibility%20criteria%20and%20income%20limits%20for%20Need%20Based%20Financial%20Assistance%3F" className="sap-chat-chip-item">
            ✦ NBFA Eligibility Criteria
          </a>
          <a href="/chat?q=fees%20maaf%20hoti%20hai%20kya%3F%20What%20is%20the%20procedure%20in%20Hindi%2FHinglish%3F" className="sap-chat-chip-item">
            ✦ fees maaf hoti hai kya? (Hinglish)
          </a>
          <a href="/chat?q=When%20is%20the%20last%20date%20and%20deadline%20to%20submit%20documents%3F" className="sap-chat-chip-item">
            ✦ Application Deadlines
          </a>
          <a href="/chat?q=What%20documents%20are%20required%20for%20income%20verification%20and%20ITR%3F" className="sap-chat-chip-item">
            ✦ Income Certificate &amp; ITR Rules
          </a>
          <a href="/chat?q=How%20does%20SBI%20Scholar%20education%20loan%20work%20at%20IIM%20Bodh%20Gaya%3F" className="sap-chat-chip-item">
            ✦ SBI Scholar Loan guidance
          </a>
        </div>

        {/* Bottom Docked Chat Input Bar (Just like ChatGPT / SAP Joule!) */}
        <div className="sap-chat-input-dock">
          <form method="GET" action="/chat" className="sap-chat-input-form">
            <span style={{ color: 'var(--sap-ai-primary)', fontSize: '16px' }}>✦</span>
            <input
              type="text"
              name="q"
              className="sap-chat-input-field"
              placeholder="Ask Sahayata any policy question (e.g. 'fees maaf hoti hai kya?' or 'what are NBFA limits?')..."
              defaultValue=""
              autoFocus
              required
            />
            <button type="submit" className="sap-btn sap-btn--ai-emphasized sap-chat-send-btn">
              ✦ Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
