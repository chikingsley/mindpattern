// types/database.ts
export interface Database {
  public: {
    Tables: {
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'timestamp'>
        Update: Partial<Omit<Message, 'id'>>
      }
      embeddings: {
        Row: Embedding
        Insert: Omit<Embedding, 'id'>
        Update: Partial<Omit<Embedding, 'id'>>
      }
      metadata: {
        Row: Metadata
        Insert: Omit<Metadata, 'id'>
        Update: Partial<Omit<Metadata, 'id'>>
      }
      long_term_memories: {
        Row: LongTermMemory
        Insert: Omit<LongTermMemory, 'id' | 'timestamp'>
        Update: Partial<Omit<LongTermMemory, 'id'>>
      }
    }
    Functions: {
      match_messages: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
          in_user_id: string
        }
        Returns: Message[]
      }
    }
  }
}

export interface Message {
  id: string
  user_id: string
  session_id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  metadata: Record<string, any>
  embedding?: number[]
}

export interface Embedding {
  id: string
  interaction_id: string
  embedding: number[]
  embedding_type: string
}

export interface Metadata {
  id: string
  interaction_id: string
  metadata: Record<string, any>
}

export interface LongTermMemory {
  id: string
  user_id: string
  category: 'pattern' | 'event'
  content: string
  metadata?: Record<string, any>
  timestamp: string
}

// Current chat types for migration
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: {
    prosody?: {
      [key: string]: number
    }
  }
}

export interface ChatSession {
  id: string
  timestamp: string
  messages: ChatMessage[]
}
