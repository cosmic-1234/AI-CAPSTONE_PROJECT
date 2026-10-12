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
              <span className="govuk-header__role-badge">
                {roleLabelMap[user.role] || user.role}: {user.name}
              </span>
              <a href="/login" className="govuk-link">
                Switch Role
              </a>
              <a href="/rag-preview" className="govuk-link">
                Knowledge Base
              </a>
              <a href="/agent-diagram" className="govuk-link">
                Agent Workflow
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
