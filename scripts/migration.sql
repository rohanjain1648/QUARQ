-- =====================================================
-- Quarq Agent — Supabase Migration
-- Based on DATABASE_ARCHITECTURE.md
-- Run this in your Supabase SQL editor
-- =====================================================

-- ─────────────────────────────────────────
-- 1. PROFILES (Identity Layer)
-- ─────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  agent_name text,
  agent_personality text default 'friendly',
  agent_use_cases text[] default '{}',
  agent_custom_prompt text,
  timezone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on Supabase Auth signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────
-- 2. CHANNELS (Communication Layer)
-- ─────────────────────────────────────────
create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,

  channel_type text not null, -- 'web', 'telegram', 'whatsapp', etc.
  external_id text,           -- telegram chat_id, phone number, etc.

  metadata jsonb default '{}'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_channels_user_id on channels(user_id);
create unique index if not exists idx_channels_user_type on channels(user_id, channel_type) where external_id is null;

-- ─────────────────────────────────────────
-- 3. CONVERSATIONS (Session Layer)
-- ─────────────────────────────────────────
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  channel_id uuid not null references channels(id) on delete cascade,

  is_active boolean default true,
  title text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_conversations_user_id on conversations(user_id);
create index if not exists idx_conversations_channel_id on conversations(channel_id);

-- ─────────────────────────────────────────
-- 4. MESSAGES (Chat History)
-- ─────────────────────────────────────────
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,

  role text not null check (role in ('user', 'assistant', 'tool', 'system')),
  content text,

  metadata jsonb default '{}'::jsonb,

  created_at timestamptz default now()
);

create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_messages_user_id on messages(user_id);

-- ─────────────────────────────────────────
-- 5. INTEGRATIONS (Action Layer)
-- Single table for all OAuth providers
-- ─────────────────────────────────────────
create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references profiles(id) on delete cascade,
  provider text not null, -- 'google', 'microsoft', 'slack', etc.

  account_email text,
  provider_account_id text,

  access_token_enc text not null,
  refresh_token_enc text,

  expires_at timestamptz,
  scopes text[],

  status text default 'active' check (status in ('active', 'revoked', 'expired')),

  metadata jsonb default '{}'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_integrations_user_id on integrations(user_id);
create index if not exists idx_integrations_provider on integrations(user_id, provider);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table profiles enable row level security;
alter table channels enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table integrations enable row level security;

-- PROFILES: users can only see and edit their own profile
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- CHANNELS: users own their channels
create policy "channels_select_own" on channels
  for select using (auth.uid() = user_id);

create policy "channels_insert_own" on channels
  for insert with check (auth.uid() = user_id);

create policy "channels_update_own" on channels
  for update using (auth.uid() = user_id);

create policy "channels_delete_own" on channels
  for delete using (auth.uid() = user_id);

-- CONVERSATIONS: users own their conversations
create policy "conversations_select_own" on conversations
  for select using (auth.uid() = user_id);

create policy "conversations_insert_own" on conversations
  for insert with check (auth.uid() = user_id);

create policy "conversations_update_own" on conversations
  for update using (auth.uid() = user_id);

-- MESSAGES: users own their messages
create policy "messages_select_own" on messages
  for select using (auth.uid() = user_id);

create policy "messages_insert_own" on messages
  for insert with check (auth.uid() = user_id);

-- INTEGRATIONS: users own their integrations
create policy "integrations_select_own" on integrations
  for select using (auth.uid() = user_id);

create policy "integrations_insert_own" on integrations
  for insert with check (auth.uid() = user_id);

create policy "integrations_update_own" on integrations
  for update using (auth.uid() = user_id);

create policy "integrations_delete_own" on integrations
  for delete using (auth.uid() = user_id);

-- =====================================================
-- updated_at trigger helper
-- =====================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute procedure set_updated_at();

create trigger channels_updated_at before update on channels
  for each row execute procedure set_updated_at();

create trigger conversations_updated_at before update on conversations
  for each row execute procedure set_updated_at();

create trigger integrations_updated_at before update on integrations
  for each row execute procedure set_updated_at();
