import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const payload = await req.text()
  const headerPayload = await headers()

  const svix_id = headerPayload.get('svix-id')!
  const svix_timestamp = headerPayload.get('svix-timestamp')!
  const svix_signature = headerPayload.get('svix-signature')!

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)

  let evt: { type: string; data: ClerkUserPayload }
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as { type: string; data: ClerkUserPayload }
  } catch {
    return new NextResponse('Invalid signature', { status: 400 })
  }

  const data = evt.data
  const eventType = evt.type
  const email = data.email_addresses?.[0]?.email_address ?? null
  const displayName = [data.first_name, data.last_name].filter(Boolean).join(' ') || null

  if (eventType === 'user.created') {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('profiles')
        .update({
          clerk_id: data.id,
          display_name: displayName,
          username: data.username ?? null,
          first_name: data.first_name ?? null,
          last_name: data.last_name ?? null,
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('profiles').insert({
        email,
        display_name: displayName,
        username: data.username ?? null,
        first_name: data.first_name ?? null,
        last_name: data.last_name ?? null,
        clerk_id: data.id,
        agent_personality: 'friendly',
      })
    }
  }

  if (eventType === 'user.updated') {
    await supabase
      .from('profiles')
      .update({
        email,
        display_name: displayName,
        username: data.username ?? null,
        first_name: data.first_name ?? null,
        last_name: data.last_name ?? null,
      })
      .eq('clerk_id', data.id)
  }

  return NextResponse.json({ success: true })
}

interface ClerkUserPayload {
  id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  email_addresses: { email_address: string }[]
}
