import { getAuthUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { profileId, supabase } = authUser
  const channel_id = req.nextUrl.searchParams.get('channel_id')

  let query = supabase
    .from('conversations')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false })

  if (channel_id) {
    query = query.eq('channel_id', channel_id).eq('is_active', true).limit(1)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ conversations: data })
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { profileId, supabase } = authUser

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { channel_id, title } = body

  if (!channel_id) return NextResponse.json({ error: 'channel_id is required' }, { status: 400 })

  await supabase
    .from('conversations')
    .update({ is_active: false })
    .eq('user_id', profileId)
    .eq('channel_id', channel_id)

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: profileId,
      channel_id,
      is_active: true,
      title: title ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ conversation: data }, { status: 201 })
}
