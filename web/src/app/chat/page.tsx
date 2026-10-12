import { getCurrentUser } from '@/lib/session';
import ChatInterface from './ChatInterface';

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
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" className="sap-btn--ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem' }}>
          ← Back to Launchpad
        </a>
        <span className="sap-badge sap-badge--info">
          Session Persona: {user.name} ({user.role.toUpperCase()})
        </span>
      </div>

      {/* Interactive SAP Joule Conversational Chatbot */}
      <ChatInterface
        user={{
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
          programme: user.programme,
          annual_family_income: user.annual_family_income,
          cgpa: user.cgpa,
        }}
        initialQuery={query}
        initialResponse={response}
      />
    </div>
  );
}
