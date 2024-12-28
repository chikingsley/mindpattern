
-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL,
  embedding vector(1024),
  emotion_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to match similar conversations
CREATE OR REPLACE FUNCTION match_conversations(query_embedding vector(1024), match_threshold float, match_count int)
RETURNS TABLE (
  id UUID,
  message TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chat_history.id,
    chat_history.message,
    1 - (chat_history.embedding <=> query_embedding) AS similarity
  FROM chat_history
  WHERE 1 - (chat_history.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
