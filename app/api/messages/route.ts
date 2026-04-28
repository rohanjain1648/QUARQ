import { getAuthUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { profileId, supabase } = authUser

  const conversation_id = req.nextUrl.searchParams.get('conversation_id')
  if (!conversation_id) {
    return NextResponse.json({ error: 'conversation_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, metadata, created_at')
    .eq('conversation_id', conversation_id)
    .eq('user_id', profileId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ messages: data })
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

  const { channel_id, content, conversation_id: provided_conv_id } = body

  if (!channel_id || !content?.trim()) {
    return NextResponse.json({ error: 'channel_id and content are required' }, { status: 400 })
  }

  let conversation_id = provided_conv_id

  if (!conversation_id) {
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', profileId)
      .eq('channel_id', channel_id)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (existing) {
      conversation_id = existing.id
    } else {
      const { data: created, error: convError } = await supabase
        .from('conversations')
        .insert({ user_id: profileId, channel_id, is_active: true })
        .select('id')
        .single()

      if (convError) return NextResponse.json({ error: convError.message }, { status: 500 })
      conversation_id = created.id
    }
  }

  const { error: insertError } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      user_id: profileId,
      role: 'user',
      content: content.trim(),
    })

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: false })
    .limit(8)

  const orderedHistory = (history ?? []).reverse()

  const { data: channel } = await supabase
    .from('channels')
    .select('channel_type')
    .eq('id', channel_id)
    .single()

  const channel_type = channel?.channel_type ?? 'web'

  let agentResponse = ''
  let agentMetadata: Record<string, unknown> = {}

  const agentUrl = process.env.AGENT_URL
  const agentSecret = process.env.AGENT_INTERNAL_SECRET

  if (agentUrl && agentSecret) {
    try {
      const agentRes = await fetch(`${agentUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': agentSecret,
        },
        body: JSON.stringify({
          user_id: profileId,
          channel_type,
          prompt: content.trim(),
          history: orderedHistory,
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (agentRes.ok) {
        const agentData = await agentRes.json()
        agentResponse = agentData.response ?? ''
        agentMetadata = agentData.metrics ?? {}
      } else {
        agentResponse = 'I encountered an issue processing your request. Please try again.'
      }
    } catch {
      agentResponse = 'I am currently unavailable. Please try again in a moment.'
    }
  } else {
    agentResponse = 'Agent service not configured. Set AGENT_URL and AGENT_INTERNAL_SECRET in .env.local.'
  }

  const { data: assistantMsg, error: assistantError } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      user_id: profileId,
      role: 'assistant',
      content: agentResponse,
      metadata: agentMetadata,
    })
    .select('id, role, content, metadata, created_at')
    .single()

  if (assistantError) return NextResponse.json({ error: assistantError.message }, { status: 500 })

  return NextResponse.json({ conversation_id, message: assistantMsg })
}
