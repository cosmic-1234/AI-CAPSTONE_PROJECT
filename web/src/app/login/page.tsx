import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'committee' | 'admin';
  programme?: string;
  batch?: string;
  annual_family_income?: number;
  cgpa?: number;
  category?: string;
  description: string;
}

const MOCK_PROFILES: UserOption[] = [
  {
    id: 'std_01',
    name: 'Amit Kumar',
    email: 'amit.k25@example.ac.in',
    role: 'student',
    programme: 'PGP',
    batch: '2025-27',
    annual_family_income: 240000,
    cgpa: 7.8,
    category: 'General',
    description: 'PGP 1st Year (Income: INR 2.4 Lakhs/yr | CGPA: 7.8) – Eligible for NBFA Tier 1',
  },
  {
    id: 'std_02',
    name: 'Priya Sharma',
    email: 'priya.s25@example.ac.in',
    role: 'student',
    programme: 'PGP',
    batch: '2025-27',
    annual_family_income: 520000,
    cgpa: 8.9,
    category: 'OBC',
    description: 'PGP 1st Year (Income: INR 5.2 Lakhs/yr | CGPA: 8.9) – Eligible for NBFA Tier 2 & Merit',
  },
  {
    id: 'std_03',
    name: 'Rahul Verma',
    email: 'rahul.v26@example.ac.in',
    role: 'student',
    programme: 'IPM',
    batch: '2026-28',
    annual_family_income: 180000,
    cgpa: 6.4,
    category: 'SC',
    description: 'IPM 1st Year (Income: INR 1.8 Lakhs/yr | CGPA: 6.4) – Low family income',
  },
  {
    id: 'staff_01',
    name: 'Sunita Verma',
    email: 'accounts.officer@example.ac.in',
    role: 'staff',
    description: 'Accounts & Finance Officer – Verifies income certificates, ITRs, fee installments',
  },
  {
    id: 'comm_01',
    name: 'Prof. R. K. Sharma',
    email: 'rk.sharma@example.ac.in',
    role: 'committee',
    description: 'Aid Committee Member – Reviews and votes on scholarship awards and fee waivers',
  },
  {
    id: 'admin_01',
    name: 'System Admin',
    email: 'admin@example.ac.in',
    role: 'admin',
    description: 'Administrator – Evaluator, hardening toggles, trace inspection, ingestion',
  },
];

async function handleLogin(formData: FormData) {
  'use server';
  const selectedId = formData.get('userId') as string;
  const user = MOCK_PROFILES.find((p) => p.id === selectedId);

  if (user) {
    const cookieStore = cookies();
    cookieStore.set('sahayata_user', JSON.stringify(user), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  redirect('/');
}

export default async function LoginPage() {
  const currentUser = await getCurrentUser();

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <a href="/" className="sap-btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem' }}>
          ← Back to Launchpad
        </a>
      </div>

      <div className="sap-card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid var(--sap-brand-blue)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.75rem' }}>
          <img
            src="/brand/iimbg-logo.png"
            alt="IIM Bodh Gaya Logo"
            width="68"
            height="54"
            style={{ objectFit: 'contain' }}
          />
          <div>
            <span className="govuk-body-s" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--sap-text-secondary)', fontWeight: 600 }}>
              Identity & Access Management (Mock Switchboard)
            </span>
            <h1 className="govuk-heading-xl" style={{ margin: '0.2rem 0', fontSize: '1.65rem' }}>
              Select Active Enterprise Persona
            </h1>
          </div>
        </div>
        <p className="govuk-body" style={{ margin: 0, color: 'var(--sap-text-secondary)' }}>
          Switch between verified campus personas to inspect role-based access control (RBAC), retrieval ACL boundaries, and permission-scoped workflows.
        </p>
      </div>

      <div className="sap-card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <form action={handleLogin} method="POST">
          <fieldset className="govuk-form-group" style={{ border: 'none', padding: 0 }}>
            <legend className="govuk-label" style={{ fontSize: '15px', fontWeight: 700, marginBottom: '1rem', color: 'var(--sap-text-primary)' }}>
              Available Test Profiles
            </legend>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {MOCK_PROFILES.map((profile) => {
                const isSelected = profile.id === currentUser.id;
                return (
                  <label
                    key={profile.id}
                    style={{
                      display: 'block',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--sap-radius-sm)',
                      border: isSelected ? '2px solid var(--sap-brand-blue)' : '1px solid var(--sap-border-color)',
                      backgroundColor: isSelected ? '#f0f4f8' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease-in-out, background-color 0.15s ease-in-out',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <input
                        type="radio"
                        name="userId"
                        value={profile.id}
                        defaultChecked={isSelected}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--sap-brand-blue)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '15px', color: 'var(--sap-text-primary)' }}>{profile.name}</strong>
                          <span className="sap-badge sap-badge--info">
                            {profile.role.toUpperCase()}
                          </span>
                        </div>
                        <div className="govuk-body-s" style={{ marginTop: '0.25rem', color: 'var(--sap-text-secondary)' }}>
                          {profile.description}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="govuk-button-group" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
            <button type="submit" className="sap-btn sap-btn--emphasized">
              Confirm and Switch Persona
            </button>
            <a href="/" className="sap-btn sap-btn--default">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
