create table agent_containers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,

  container_id text not null,       -- The actual Docker SHA ID
  container_name text not null,     -- e.g., quarq-agent-uuid
  host_port integer not null,       -- e.g., 8001
  live_url text not null,           -- The endpoint the frontend will talk to

  status text default 'active',     -- active, paused, terminated
  started_at timestamptz default now(),
  terminated_at timestamptz
);

create index idx_agent_containers_user_id on agent_containers(user_id);
