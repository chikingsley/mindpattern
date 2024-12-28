-- Drop existing tables if they exist
drop table if exists "public"."long_term_memories";
drop table if exists "public"."metadata";
drop table if exists "public"."embeddings";
drop table if exists "public"."interactions";

-- Create tables with text user_id instead of uuid
create table if not exists "public"."interactions" (
    "id" uuid default gen_random_uuid() primary key,
    "user_id" text not null,  -- Changed from uuid to text to support Clerk IDs
    "input_type" text not null check (input_type in ('text', 'voice')),
    "content" text not null,
    "timestamp" timestamptz default now(),
    "session_id" text
);

create table if not exists "public"."embeddings" (
    "id" uuid default gen_random_uuid() primary key,
    "interaction_id" uuid references public.interactions(id) on delete cascade,
    "embedding" vector(1536),
    "embedding_type" text not null
);

create table if not exists "public"."metadata" (
    "id" uuid default gen_random_uuid() primary key,
    "interaction_id" uuid references public.interactions(id) on delete cascade,
    "metadata" jsonb not null default '{}'::jsonb
);

create table if not exists "public"."long_term_memories" (
    "id" uuid default gen_random_uuid() primary key,
    "user_id" text not null,  -- Changed from uuid to text to support Clerk IDs
    "category" text check (category in ('pattern', 'event')),
    "content" text not null,
    "timestamp" timestamptz default now()
);

-- Enable RLS
alter table "public"."interactions" enable row level security;
alter table "public"."embeddings" enable row level security;
alter table "public"."metadata" enable row level security;
alter table "public"."long_term_memories" enable row level security;

-- Create policies
create policy "Users can read their own interactions"
    on interactions for select
    using (auth.uid()::text = user_id);

create policy "Users can insert their own interactions"
    on interactions for insert
    with check (auth.uid()::text = user_id);

create policy "Users can read embeddings for their interactions"
    on embeddings for select
    using (
        exists (
            select 1 from interactions
            where interactions.id = embeddings.interaction_id
            and interactions.user_id = auth.uid()::text
        )
    );

create policy "Users can insert embeddings for their interactions"
    on embeddings for insert
    with check (
        exists (
            select 1 from interactions
            where interactions.id = embeddings.interaction_id
            and interactions.user_id = auth.uid()::text
        )
    );

create policy "Users can read metadata for their interactions"
    on metadata for select
    using (
        exists (
            select 1 from interactions
            where interactions.id = metadata.interaction_id
            and interactions.user_id = auth.uid()::text
        )
    );

create policy "Users can insert metadata for their interactions"
    on metadata for insert
    with check (
        exists (
            select 1 from interactions
            where interactions.id = metadata.interaction_id
            and interactions.user_id = auth.uid()::text
        )
    );

create policy "Users can read their own memories"
    on long_term_memories for select
    using (auth.uid()::text = user_id);

create policy "Users can insert their own memories"
    on long_term_memories for insert
    with check (auth.uid()::text = user_id);
