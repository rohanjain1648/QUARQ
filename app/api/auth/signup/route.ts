import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // 🛠️ CHANGED: Wrapped JSON parsing in try/catch
  let body;
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, password, name } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name || '' },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // 🛠️ CHANGED: REMOVED the manual `profiles` update here. 
  // We established earlier that RLS blocks this if email confirmations are enabled. 
  // The DB trigger + frontend login flow handles this securely now.

  return NextResponse.json({ user: data.user, session: data.session })
}