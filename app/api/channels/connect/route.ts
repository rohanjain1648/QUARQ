import { getAuthUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { profileId, supabase } = authUser

  try {
    const { channel_type } = await req.json()
    if (channel_type !== 'telegram') {
      return NextResponse.json({ error: 'Invalid channel type' }, { status: 400 })
    }

    let { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', profileId)
      .eq('channel_type', 'telegram')
      .is('external_id', null)
      .maybeSingle()

    if (channelError) throw channelError

    if (!channel) {
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({ user_id: profileId, channel_type: 'telegram' })
        .select('id')
        .single()

      if (createError) throw createError
      channel = newChannel
    }

    const token = `qrq_${uuidv4().replace(/-/g, '').slice(0, 12)}`

    const { error: tokenError } = await supabase
      .from('channel_connection_tokens')
      .insert({
        user_id: profileId,
        channel_id: channel!.id,
        token,
      })

    if (tokenError) throw tokenError

    return NextResponse.json({ token })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Connection Token Error]:', msg)
    return NextResponse.json({ error: 'Failed to generate connection link' }, { status: 500 })
  }
}
