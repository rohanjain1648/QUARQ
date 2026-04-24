import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let query = supabase
    .from('integrations')
    .select('id, provider, account_email, scopes, status, expires_at, created_at')
    .eq('user_id', user.id)

  const provider = req.nextUrl.searchParams.get('provider')
  if (provider) {
    query = query.eq('provider', provider)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ integrations: data })
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

  const {
    provider,
    account_email,
    provider_account_id,
    access_token_enc,
    refresh_token_enc,
    expires_at,
    scopes,
    metadata,
  } = body

  if (!provider || !access_token_enc) {
    return NextResponse.json({ error: 'provider and access_token_enc are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('integrations')
    .upsert(
      {
        user_id: user.id,
        provider,
        account_email: account_email ?? null,
        provider_account_id: provider_account_id ?? null,
        access_token_enc,
        refresh_token_enc: refresh_token_enc ?? null,
        expires_at: expires_at ?? null,
        scopes: scopes ?? [],
        status: 'active',
        metadata: metadata ?? {},
      },
      { onConflict: 'user_id, provider' }
    )
    .select('id, provider, account_email, scopes, status')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ integration: data }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const provider = req.nextUrl.searchParams.get('provider')
  if (!provider) {
    return NextResponse.json({ error: 'provider is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('integrations')
    .update({ status: 'revoked' })
    .eq('user_id', user.id)
    .eq('provider', provider)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}