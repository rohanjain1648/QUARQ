import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.error('KV_REST_API_URL / KV_REST_API_TOKEN not set — add Upstash Redis via Vercel Marketplace');
    return NextResponse.json({ ok: false, message: 'Waitlist temporarily unavailable' }, { status: 503 });
  }
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
