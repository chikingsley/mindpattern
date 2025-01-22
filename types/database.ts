// types/database.ts

export interface User {
  id: string
  email?: string
  configId?: string
  systemPrompt?: string
  createdAt?: Date
}

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
