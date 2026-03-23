import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: 'Invalid email' }, { status: 400 });
  }
  const normalized = email.toLowerCase().trim();
  const existing = await kv.sismember('waitlist', normalized);
  if (existing) return NextResponse.json({ ok: true, message: "You're already on the list!" });
  await kv.sadd('waitlist', normalized);
  await kv.zadd('waitlist_ts', { score: Date.now(), member: normalized });
  return NextResponse.json({ ok: true, message: "You're on the list!" });
}
