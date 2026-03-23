import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let email: string;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request' }, { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, message: 'Invalid email' }, { status: 400 });
  }

  const normalized = email.toLowerCase().trim();

  try {
    const sql = neon(process.env.POSTGRES_URL!);

    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id         SERIAL PRIMARY KEY,
        email      TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`INSERT INTO waitlist (email) VALUES (${normalized})`;

    return NextResponse.json({ ok: true, message: "You're on the list!" });
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json({ ok: true, message: "You're already on the list!" });
    }
    console.error('[waitlist]', err?.message ?? err);
    return NextResponse.json(
      { ok: false, message: 'Something went wrong. Try again.' },
      { status: 500 }
    );
  }
}
