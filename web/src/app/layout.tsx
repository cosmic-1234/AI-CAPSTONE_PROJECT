import type { Metadata } from 'next';
import './globals.css';
import { getCurrentUser } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Sahayata – Financial Aid Desk | IIM Bodh Gaya',
  description: 'Student Financial Assistance, Scholarships, Fee Waivers & Education Loan Guidance Portal at Indian Institute of Management Bodh Gaya.',
  icons: {
    icon: '/brand/iimbg-logo.png',
    shortcut: '/brand/iimbg-logo.png',
    apple: '/brand/iimbg-logo.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  const roleLabelMap: Record<string, string> = {
    student: 'Student',
    staff: 'Accounts Officer',
    committee: 'Aid Committee',
    admin: 'Administrator',
  };

  return (
    <html lang="en">
      <body>
        {/* Navigation & Institute Brand Header */}
        <header className="govuk-header" role="banner">
          <div className="govuk-width-container govuk-header__container">
            <a href="/" className="govuk-header__brand">
              <div className="govuk-header__logo-box">
                <img
                  src="/brand/iimbg-logo.png"
                  alt="IIM Bodh Gaya Emblem"
                  width="52"
                  height="42"
                  className="govuk-header__logo-img"
                />
              </div>
              <div className="govuk-header__titles">
                <span className="govuk-header__institute">IIM BODH GAYA</span>
                <span className="govuk-header__portal">Sahayata – Financial Aid Desk</span>
              </div>
            </a>

            <nav className="govuk-header__nav" aria-label="Account navigation">
              <a href="/chat" className="sap-header-joule-btn">
                <span>✦ Sahayata Copilot</span>
                <span className="sap-ai-pulse-dot" style={{ width: 6, height: 6 }} />
              </a>
              <span className="govuk-header__role-badge">
                {roleLabelMap[user.role] || user.role}: {user.name}
              </span>
              <a href="/login" className="govuk-link">
                Switch Role
              </a>
              <a href="/rag-preview" className="govuk-link">
                Knowledge Base
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="govuk-width-container">
          <main id="main-content" className="govuk-main-wrapper" role="main">
            {children}
          </main>
        </div>

        {/* Persistent Floating SAP Joule AI Copilot Chatbot Dock */}
        <aside className="sap-joule-floating-widget" aria-label="Sahayata AI Assistant">
          <details>
            <summary className="sap-joule-trigger-btn">
              <span style={{ fontSize: '16px' }}>✦</span>
              <span>Ask Sahayata AI</span>
              <span className="sap-ai-pulse-dot" style={{ backgroundColor: '#ffffff' }} />
            </summary>
            <div className="sap-joule-popover" role="dialog" aria-modal="false" aria-label="Sahayata AI Assistant Quick Chat">
              <div className="sap-joule-popover-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <img
                    src="/brand/iimbg-logo.png"
                    alt="IIM Bodh Gaya"
                    width="28"
                    height="22"
                    style={{ objectFit: 'contain', backgroundColor: '#ffffff', padding: '2px', borderRadius: '2px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', lineHeight: 1.2 }}>Sahayata AI Copilot</strong>
                    <span style={{ fontSize: '11px', color: '#c4b5fd' }}>Powered by SAP Joule & Policy Graph</span>
                  </div>
                </div>
                <span className="sap-badge sap-badge--ai" style={{ fontSize: '10px', padding: '0.15rem 0.45rem' }}>
                  ✦ ACTIVE
                </span>
              </div>
              <div className="sap-joule-popover-body">
                <div style={{ fontSize: '12px', color: 'var(--sap-text-secondary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                  Real-time policy intelligence grounded deterministically in approved IIM Bodh Gaya statutes.
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--sap-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                    Suggested Prompts
                  </span>
                  <a href="/chat?q=What%20are%20the%20eligibility%20criteria%20for%20Need%20Based%20Financial%20Assistance%3F" className="sap-joule-quick-chip">
                    ✦ Check NBFA Fee Waiver Criteria
                  </a>
                  <a href="/chat?q=What%20documents%20are%20required%20for%20income%20verification%20and%20ITR%3F" className="sap-joule-quick-chip">
                    ✦ What documents are needed for ITR?
                  </a>
                  <a href="/chat?q=How%20does%20SBI%20Scholar%20education%20loan%20work%20at%20IIM%20Bodh%20Gaya%3F" className="sap-joule-quick-chip">
                    ✦ SBI Scholar Loan guidance & terms
                  </a>
                  <a href="/check-eligibility" className="sap-joule-quick-chip" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
                    ✦ Interactive 4-Step Eligibility Wizard →
                  </a>
                </div>

                {/* Instant Query Form */}
                <form method="GET" action="/chat" style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      name="q"
                      placeholder="Ask any policy question..."
                      className="govuk-input"
                      style={{ fontSize: '13px', padding: '0.45rem 0.65rem' }}
                      required
                    />
                    <button type="submit" className="sap-btn sap-btn--ai-emphasized" style={{ padding: '0.45rem 0.85rem', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      ✦ Ask
                    </button>
                  </div>
                </form>

                <div style={{ marginTop: '0.75rem', textAlign: 'center', borderTop: '1px solid #e2d9fc', paddingTop: '0.5rem' }}>
                  <a href="/chat" style={{ fontSize: '12px', color: 'var(--sap-ai-primary)', fontWeight: 600 }}>
                    Open Full-Screen CoPilot Desk →
                  </a>
                </div>
              </div>
            </div>
          </details>
        </aside>

        {/* Accessible Footer with Office Contacts and Brand Emblem */}
        <footer className="govuk-footer" role="contentinfo">
          <div className="govuk-width-container">
            <div className="govuk-footer__meta">
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <img
                  src="/brand/iimbg-logo.png"
                  alt="IIM Bodh Gaya Logo"
                  width="72"
                  height="58"
                  style={{ objectFit: 'contain', backgroundColor: '#ffffff', padding: '4px', borderRadius: '4px', border: '1px solid #e2e4e8' }}
                />
                <div>
                  <h3 className="govuk-heading-m" style={{ marginTop: 0 }}>
                    Indian Institute of Management Bodh Gaya
                  </h3>
                  <p className="govuk-body-s">
                    Administrative Block, Prabandh Vihar, Bodh Gaya, Bihar 824234
                  </p>
                  <ul className="govuk-footer__contact">
                    <li><strong>Accounts Office:</strong> accounts@example.ac.in | +91-631-2200234</li>
                    <li><strong>Financial Aid Committee:</strong> aid-committee@example.ac.in</li>
                    <li><strong>Wellbeing & Counselling Cell:</strong> wellbeing@example.ac.in</li>
                  </ul>
                </div>
              </div>
              <div style={{ maxWidth: '320px' }}>
                <h4 className="govuk-heading-s">Quick Links</h4>
                <p className="govuk-body-s">
                  <a href="/">Home</a> | <a href="/login">Mock Login</a> | <a href="/rag-preview">Policy Retrieval Search</a>
                </p>
                <p className="govuk-body-s" style={{ marginTop: '0.75rem' }}>
                  All financial aid decisions are subject to Aid Committee approval.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
