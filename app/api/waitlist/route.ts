import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_PAT;
const REPO = 'vk-agent-labs/quarq-website';
const FILE_PATH = 'data/waitlist.json';

async function getWaitlist(): Promise<string[]> {
  if (!GITHUB_TOKEN) return [];
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json() as { content: string };
  return JSON.parse(Buffer.from(data.content, 'base64').toString());
}

async function saveWaitlist(emails: string[], sha?: string): Promise<boolean> {
  if (!GITHUB_TOKEN) return false;
  const content = Buffer.from(JSON.stringify(emails, null, 2)).toString('base64');
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `waitlist: add email (${emails.length} total)`, content, sha }),
  });
  return res.ok;
}

async function getFileSha(): Promise<string | undefined> {
  if (!GITHUB_TOKEN) return undefined;
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` },
    cache: 'no-store',
  });
  if (!res.ok) return undefined;
  const data = await res.json() as { sha: string };
  return data.sha;
}

export async function POST(req: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ ok: false, message: 'Waitlist temporarily unavailable.' }, { status: 503 });
  }
  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: 'Invalid email' }, { status: 400 });
  }
  const normalized = email.toLowerCase().trim();
  const [existing, sha] = await Promise.all([getWaitlist(), getFileSha()]);
  if (existing.includes(normalized)) {
    return NextResponse.json({ ok: true, message: "You're already on the list!" });
  }
  const saved = await saveWaitlist([...existing, normalized], sha);
  if (!saved) {
    return NextResponse.json({ ok: false, message: 'Could not save. Try again.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, message: "You're on the list!" });
}
