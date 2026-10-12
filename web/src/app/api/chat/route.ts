import { NextResponse } from 'next/server';
import { getCurrentUser, API_BASE_URL } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const message = body.message || '';

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Realistic AI thinking delay (1.2 seconds) so the user experiences the AI reasoning process
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const res = await fetch(`${API_BASE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        role: user.role,
        studentId: user.id,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      console.error(`[Chat API Proxy] Backend returned ${res.status}:`, errorText);
      return NextResponse.json(
        { error: `The assistant server returned an error (${res.status}). Please try again in a moment.` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Chat API Proxy] Fetch exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
