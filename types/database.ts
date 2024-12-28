export interface Database {
  public: {
    Tables: {
      interactions: {
        Row: Interaction
        Insert: Omit<Interaction, 'id' | 'timestamp'>
        Update: Partial<Omit<Interaction, 'id'>>
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
  }
}

export interface Interaction {
  id: string
  user_id: string
  input_type: 'text' | 'voice'
  content: string
  timestamp: string
  session_id?: string
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
