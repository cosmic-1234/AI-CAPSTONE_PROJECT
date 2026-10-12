import { cookies } from 'next/headers';

function cleanUrl(rawUrl?: string): string {
  if (!rawUrl) return 'http://localhost:4000';
  let url = rawUrl.trim();
  // Auto-correct if user accidentally duplicated the URL (e.g. https://foo/https://foo)
  const matches = url.match(/(https?:\/\/[^\s\/]+)/g);
  if (matches && matches.length > 1) {
    url = matches[0];
  }
  // Strip trailing slashes so `${API_BASE_URL}/api/...` formats correctly
  return url.replace(/\/+$/, '');
}

export const API_BASE_URL: string = cleanUrl(
  process.env.INTERNAL_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL
);

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'committee' | 'admin';
  programme?: string;
  batch?: string;
  annual_family_income?: number;
  cgpa?: number;
  category?: string;
}

export const DEFAULT_STUDENT: UserSession = {
  id: 'std_01',
  name: 'Amit Kumar',
  email: 'amit.k25@example.ac.in',
  role: 'student',
  programme: 'PGP',
  batch: '2025-27',
  annual_family_income: 240000,
  cgpa: 7.8,
  category: 'General',
};

export async function getCurrentUser(): Promise<UserSession> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('sahayata_user');
  if (sessionCookie?.value) {
    try {
      return JSON.parse(sessionCookie.value) as UserSession;
    } catch {
      // invalid cookie, return default
    }
  }
  return DEFAULT_STUDENT;
}
