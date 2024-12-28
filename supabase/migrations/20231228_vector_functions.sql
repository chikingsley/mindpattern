-- Enable pgvector extension
create extension if not exists vector;

-- Function to match interactions using vector similarity
create or replace function match_interactions(
  query_embedding vector(1024),
  match_threshold float,
  match_count int,
  in_user_id text
)
returns table (
  id uuid,
  user_id text,
  content text,
  input_type text,
  created_at timestamptz,
  session_id text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    i.id,
    i.user_id,
    i.content,
    i.input_type,
    i."timestamp" as created_at,
    i.session_id,
    1 - (e.embedding <=> query_embedding) as similarity
  from interactions i
  join embeddings e on e.interaction_id = i.id
  where i.user_id = in_user_id
  and 1 - (e.embedding <=> query_embedding) > match_threshold
  order by e.embedding <=> query_embedding
  limit match_count;
end;
$$;
