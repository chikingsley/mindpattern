// types/database.ts

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
