// app/api/channels/connect/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid' // Ensure you have uuid installed: npm install uuid

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { channel_type } = await req.json()
    if (channel_type !== 'telegram') {
      return NextResponse.json({ error: 'Invalid channel type' }, { status: 400 })
    }

    // 2. Find or Create the 'telegram' channel for this user
    // We look for a telegram channel that doesn't have an external_id yet
    let { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('user_id', user.id)
      .eq('channel_type', 'telegram')
      .is('external_id', null)
      .maybeSingle()

    if (!channel) {
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({ user_id: user.id, channel_type: 'telegram' })
        .select('id')
        .single()
      
      if (createError) throw createError
      channel = newChannel
    }

    // 3. Generate a secure unique token
    const token = `qrq_${uuidv4().replace(/-/g, '').slice(0, 12)}`

    // 4. Store in channel_connection_tokens
    const { error: tokenError } = await supabase
      .from('channel_connection_tokens')
      .insert({
        user_id: user.id,
        channel_id: channel.id,
        token: token
      })

    if (tokenError) throw tokenError

    return NextResponse.json({ token })
  } catch (error: any) {
    console.error('[Connection Token Error]:', error.message)
    return NextResponse.json({ error: 'Failed to generate connection link' }, { status: 500 })
  }
}