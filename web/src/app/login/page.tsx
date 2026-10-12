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
      <h1 className="govuk-heading-xl">Select User Role</h1>
      <p className="govuk-body-lead">
        Choose a role to test permissions, access control lists (ACL), and personalized aid recommendations.
      </p>

      <form action={handleLogin} method="POST">
        <fieldset className="govuk-form-group">
          <legend className="govuk-label" style={{ fontSize: '21px', marginBottom: '1rem' }}>
            Available Personas
          </legend>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {MOCK_PROFILES.map((profile) => {
              const isSelected = profile.id === currentUser.id;
              return (
                <label
                  key={profile.id}
                  style={{
                    display: 'block',
                    padding: '1rem',
                    border: isSelected ? '2px solid #0b0c0c' : '1px solid #b1b4b6',
                    backgroundColor: isSelected ? '#f3f2f1' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="radio"
                      name="userId"
                      value={profile.id}
                      defaultChecked={isSelected}
                      style={{ width: '22px', height: '22px' }}
                    />
                    <div>
                      <strong>{profile.name}</strong>{' '}
                      <span className="govuk-tag" style={{ marginLeft: '0.5rem' }}>
                        {profile.role.toUpperCase()}
                      </span>
                      <div className="govuk-body-s" style={{ marginTop: '0.25rem' }}>
                        {profile.description}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="govuk-button-group">
          <button type="submit" className="govuk-button">
            Confirm and Switch Role
          </button>
          <a href="/" className="govuk-button govuk-button--secondary">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
