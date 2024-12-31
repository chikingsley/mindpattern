-- Drop old tables, policies and triggers
drop trigger if exists update_active_resources_updated_at on active_resources;
drop trigger if exists update_active_tools_updated_at on active_tools;
drop trigger if exists update_resource_cache_updated_at on resource_cache;

drop policy if exists "Users can read their own active resources" on active_resources;
drop policy if exists "Users can insert their own active resources" on active_resources;
drop policy if exists "Users can update their own active resources" on active_resources;
drop policy if exists "Users can delete their own active resources" on active_resources;

drop policy if exists "Users can read their active tools" on active_tools;
drop policy if exists "Users can manage their active tools" on active_tools;

drop policy if exists "Anyone can read cache" on resource_cache;
drop policy if exists "Anyone can manage cache" on resource_cache;

-- Drop all old tables
drop table if exists tool_versions cascade;
drop table if exists tools cascade;
drop table if exists voice_versions cascade;
drop table if exists voices cascade;
drop table if exists active_configs cascade;
drop table if exists active_tools cascade;
drop table if exists active_resources cascade;
drop table if exists resource_cache cascade;

-- Create extension for UUIDs if not exists
create extension if not exists "uuid-ossp";

-- Table for tracking active resources per user
create table if not exists active_resources (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id),
  
  -- Config
  config_id text not null,
  config_version integer not null,
  
  -- Prompt
  prompt_id text not null,
  prompt_version integer not null,
  
  -- Voice (optional)
  voice_id text,
  voice_version integer,
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Each user can only have one active set
  unique(user_id)
);

-- Table for active tools (many-to-one with active_resources)
create table if not exists active_tools (
  id uuid default uuid_generate_v4() primary key,
  active_resource_id uuid not null references active_resources(id) on delete cascade,
  tool_id text not null,
  tool_version integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Table for caching API responses
create table if not exists resource_cache (
  id text primary key, -- Format: "type:id:version"
  resource_type text not null check (resource_type in ('config', 'prompt', 'tool', 'voice')),
  resource_id text not null,
  version integer not null,
  data jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Add indexes to improve query performance
create index if not exists "idx_resource_cache_lookup" 
  on resource_cache(resource_type, resource_id, version);

create index if not exists "idx_resource_cache_expiry" 
  on resource_cache(expires_at);

-- Enable RLS
alter table active_resources enable row level security;
alter table active_tools enable row level security;
alter table resource_cache enable row level security;

-- RLS Policies

-- Active Resources
create policy "Users can read their own active resources"
  on active_resources for select
  using (auth.uid() = user_id);

create policy "Users can insert their own active resources"
  on active_resources for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own active resources"
  on active_resources for update
  using (auth.uid() = user_id);

create policy "Users can delete their own active resources"
  on active_resources for delete
  using (auth.uid() = user_id);

-- Active Tools
create policy "Users can read their active tools"
  on active_tools for select
  using (
    exists (
      select 1 from active_resources
      where id = active_tools.active_resource_id
      and user_id = auth.uid()
    )
  );

create policy "Users can manage their active tools"
  on active_tools for all
  using (
    exists (
      select 1 from active_resources
      where id = active_tools.active_resource_id
      and user_id = auth.uid()
    )
  );

-- Resource Cache
create policy "Anyone can read cache"
  on resource_cache for select
  to authenticated
  using (true);

create policy "Anyone can manage cache"
  on resource_cache for all
  to authenticated
  using (true);

-- Update triggers
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_active_resources_updated_at
  before update on active_resources
  for each row
  execute function update_updated_at();

create trigger update_active_tools_updated_at
  before update on active_tools
  for each row
  execute function update_updated_at();

create trigger update_resource_cache_updated_at
  before update on resource_cache
  for each row
  execute function update_updated_at();
