
import { supabase } from './supabase'
import { generateEmbeddings } from './embeddings'

export interface ChatMessage {
  id?: string
  session_id: string
  message: string
  role: 'user' | 'assistant'
  emotion_scores?: any
}

export async function storeMessage(message: ChatMessage) {
  const embedding = await generateEmbeddings(message.message)
  
  const { data, error } = await supabase
    .from('chat_history')
    .insert({
      ...message,
      embedding
    })
    .select()

  if (error) throw error
  return data
}

export async function findSimilarMessages(query: string, threshold = 0.7, limit = 5) {
  const embedding = await generateEmbeddings(query)

  const { data, error } = await supabase
    .rpc('match_conversations', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit
    })

  if (error) throw error
  return data
}
