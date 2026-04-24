import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const channel_id = req.nextUrl.searchParams.get('channel_id')

  let query = supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (channel_id) {
    query = query.eq('channel_id', channel_id).eq('is_active', true).limit(1)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ conversations: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 🛠️ CHANGED: Wrapped JSON parsing in try/catch
  let body;
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { channel_id, title } = body

  if (!channel_id) {
    return NextResponse.json({ error: 'channel_id is required' }, { status: 400 })
  }

  await supabase
    .from('conversations')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('channel_id', channel_id)

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      channel_id,
      is_active: true,
      title: title ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ conversation: data }, { status: 201 })
}