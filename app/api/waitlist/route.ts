/**
 * Waitlist API — dual-mode storage
 *
 * Priority:
 *   1. Vercel Postgres (POSTGRES_URL env var set) — persistent, scalable
 *   2. GitHub file storage fallback (GITHUB_PAT) — works without a DB
 *
 * To activate Postgres: add a Vercel Postgres database in the Vercel dashboard
 * (Storage → Create → Postgres) and link it to this project. The POSTGRES_URL
 * env var is injected automatically.
 */

import { NextRequest, NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Postgres storage ──────────────────────────────────────────────────────────

async function insertPostgres(email: string): Promise<'ok' | 'duplicate' | 'error'> {
  try {
    const { sql } = await import('@vercel/postgres');
    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id         SERIAL PRIMARY KEY,
        email      TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`INSERT INTO waitlist (email) VALUES (${email})`;
    return 'ok';
  } catch (err: any) {
    if (err?.code === '23505') return 'duplicate';
    console.error('[waitlist/postgres]', err?.message ?? err);
    return 'error';
  }
}

// ── GitHub file storage fallback ──────────────────────────────────────────────

const GH_TOKEN = process.env.GITHUB_PAT;
const GH_REPO  = 'Robin20201/quarq-website';
const GH_FILE  = 'data/waitlist.json';
const GH_BASE  = 'https://api.github.com';

async function ghGet(): Promise<{ emails: string[]; sha: string } | null> {
  if (!GH_TOKEN) return null;
  const res = await fetch(`${GH_BASE}/repos/${GH_REPO}/contents/${GH_FILE}`, {
    headers: { Authorization: `token ${GH_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = await res.json() as { content: string; sha: string };
  return {
    emails: JSON.parse(Buffer.from(data.content, 'base64').toString()),
    sha: data.sha,
  };
}

async function ghPut(emails: string[], sha: string): Promise<boolean> {
  if (!GH_TOKEN) return false;
  const content = Buffer.from(JSON.stringify(emails, null, 2)).toString('base64');
  const res = await fetch(`${GH_BASE}/repos/${GH_REPO}/contents/${GH_FILE}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GH_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `waitlist: add email (${emails.length} total)`,
      content,
      sha,
    }),
  });
  return res.ok;
}

async function insertGitHub(email: string): Promise<'ok' | 'duplicate' | 'error'> {
  const state = await ghGet();
  if (!state) return 'error';
  const { emails, sha } = state;
  if (emails.includes(email)) return 'duplicate';
  const saved = await ghPut([...emails, email], sha);
  return saved ? 'ok' : 'error';
}

// ── Handler ───────────────────────────────────────────────────────────────────

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
  const usePostgres = !!process.env.POSTGRES_URL;

  const result = usePostgres
    ? await insertPostgres(normalized)
    : await insertGitHub(normalized);

  if (result === 'ok') {
    return NextResponse.json({ ok: true, message: "You're on the list!" });
  }
  if (result === 'duplicate') {
    return NextResponse.json({ ok: true, message: "You're already on the list!" });
  }
  return NextResponse.json(
    { ok: false, message: 'Something went wrong. Try again.' },
    { status: 500 }
  );
}
