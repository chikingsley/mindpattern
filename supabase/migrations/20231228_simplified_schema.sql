-- Enable pgvector extension
create extension if not exists vector;

-- Drop existing tables if they exist
drop table if exists "public"."messages" cascade;
drop table if exists "public"."interactions" cascade;
drop table if exists "public"."embeddings" cascade;
drop table if exists "public"."metadata" cascade;
drop table if exists "public"."long_term_memories" cascade;

-- Create messages table
create table if not exists "public"."messages" (
    "id" uuid default gen_random_uuid() primary key,
    "user_id" uuid not null,
    "session_id" uuid not null,
    "content" text not null,
    "role" text not null check (role in ('user', 'assistant')),
    "timestamp" timestamptz default now(),
    "metadata" jsonb default '{}'::jsonb,
    "embedding" vector(1024),
    
    constraint "messages_user_id_fkey" 
        foreign key ("user_id") 
        references auth.users(id)
);

-- Create vector similarity index
create index on messages using ivfflat (embedding vector_cosine_ops)
where embedding is not null;

-- Enable RLS
alter table if exists "public"."messages" enable row level security;

-- Create RLS policies
create policy "Users can read their own messages"
    on messages for select
    using (user_id = auth.uid());

create policy "Users can insert their own messages"
    on messages for insert
    with check (user_id = auth.uid());

-- Function for similarity search
create or replace function match_messages(
    query_embedding vector(1024),
    match_threshold float,
    match_count int,
    in_user_id uuid
)
returns table (
    id uuid,
    content text,
    role text,
    similarity float,
    metadata jsonb,
    created_at timestamptz
)
language plpgsql
as $$
begin
    return query
    select
        messages.id,
        messages.content,
        messages.role,
        1 - (messages.embedding <=> query_embedding) as similarity,
        messages.metadata,
        messages."timestamp" as created_at
    from messages
    where messages.user_id = in_user_id
    and messages.embedding is not null
    and 1 - (messages.embedding <=> query_embedding) > match_threshold
    order by messages.embedding <=> query_embedding
    limit match_count;
end;
$$;
