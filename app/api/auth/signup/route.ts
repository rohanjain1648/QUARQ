import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()

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

  // Update display_name in profiles if provided
  if (data.user && name) {
    await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', data.user.id)
  }

  return NextResponse.json({ user: data.user, session: data.session })
}
