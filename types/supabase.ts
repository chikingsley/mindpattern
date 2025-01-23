export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string
          session_id: string
          role: string
          content: string
          timestamp: string
          metadata: Record<string, any> | null
        }
        Insert: {
          id?: string
          session_id: string
          role: string
          content: string
          timestamp?: string
          metadata?: Record<string, any> | null
        }
      }
      message_vectors: {
        Row: {
          id: string
          message_id: string
          embedding: number[]
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          embedding: number[]
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          timestamp: string
        }
      }
    }
    Functions: {
      match_messages: {
        Args: {
          query_embedding: number[]
          similarity_threshold: number
          match_count: number
          session_uuid: string
        }
        Returns: Array<{
          id: string
          content: string
          similarity: number
          metadata: Record<string, any> | null
        }>
      }
    }
  }
} 