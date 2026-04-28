import { getAuthUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { profileId, supabase } = authUser

  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ channels: data })
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

  const { channel_type, external_id, metadata } = body

  if (!channel_type) return NextResponse.json({ error: 'channel_type is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('channels')
    .insert({
      user_id: profileId,
      channel_type,
      external_id: external_id ?? null,
      metadata: metadata ?? {},
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ channel: data }, { status: 201 })
}
