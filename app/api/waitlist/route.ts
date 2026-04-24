import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  // 🛠️ Wrap JSON parsing to prevent 500 crashes
  let body;
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request' }, { status: 400 })
  }

  const { email } = body

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, message: 'Invalid email' }, { status: 400 })
  }

  const normalized = email.toLowerCase().trim()
  const supabase = await createClient()

  const { error } = await supabase
    .from('waitlist')
    .insert({ email: normalized })

  if (error) {
    // '23505' is the Postgres code for Unique Constraint Violation
    if (error.code === '23505') {
      return NextResponse.json({ ok: true, message: "You're already on the list!" })
    }
    
    console.error('[waitlist error]', error.message)
    return NextResponse.json(
      { ok: false, message: 'Something went wrong. Try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, message: "You're on the list!" })
}