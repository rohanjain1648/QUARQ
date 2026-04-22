import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/messages?conversation_id=xxx — fetch chat history for a conversation
export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const conversation_id = req.nextUrl.searchParams.get('conversation_id')
  if (!conversation_id) {
    return NextResponse.json({ error: 'conversation_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, metadata, created_at')
    .eq('conversation_id', conversation_id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ messages: data })
}

// POST /api/messages — send a message and get agent response
// Body: { channel_id, content, conversation_id? }
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { channel_id, content, conversation_id: provided_conv_id } = await req.json()

  if (!channel_id || !content?.trim()) {
    return NextResponse.json({ error: 'channel_id and content are required' }, { status: 400 })
  }

  // ── Step 1: Resolve conversation ──────────────────────────────────────────
  let conversation_id = provided_conv_id

  if (!conversation_id) {
    // Find existing active conversation for this channel
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)
      .eq('channel_id', channel_id)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (existing) {
      conversation_id = existing.id
    } else {
      // Create a new conversation
      const { data: created, error: convError } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, channel_id, is_active: true })
        .select('id')
        .single()

      if (convError) {
        return NextResponse.json({ error: convError.message }, { status: 500 })
      }
      conversation_id = created.id
    }
  }

  // ── Step 2: Store the user message ────────────────────────────────────────
  const { error: insertError } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      user_id: user.id,
      role: 'user',
      content: content.trim(),
    })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // ── Step 3: Fetch recent chat history (last 8 messages) ───────────────────
  // Per DATABASE_ARCHITECTURE.md: only last 5–10 to avoid blowing LLM context
  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: false })
    .limit(8)

  const orderedHistory = (history ?? []).reverse()

  // ── Step 4: Get channel info for channel_type ─────────────────────────────
  const { data: channel } = await supabase
    .from('channels')
    .select('channel_type')
    .eq('id', channel_id)
    .single()

  const channel_type = channel?.channel_type ?? 'web'

  // ── Step 5: Call the Python Agent ─────────────────────────────────────────
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
          user_id: user.id,
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
    // Agent not configured — return a placeholder
    agentResponse = 'Agent service not configured. Set AGENT_URL and AGENT_INTERNAL_SECRET in .env.local.'
  }

  // ── Step 6: Store the assistant message ───────────────────────────────────
  const { data: assistantMsg, error: assistantError } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      user_id: user.id,
      role: 'assistant',
      content: agentResponse,
      metadata: agentMetadata,
    })
    .select('id, role, content, metadata, created_at')
    .single()

  if (assistantError) {
    return NextResponse.json({ error: assistantError.message }, { status: 500 })
  }

  return NextResponse.json({
    conversation_id,
    message: assistantMsg,
  })
}
