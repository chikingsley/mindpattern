"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ChatSession {
  id: string
  timestamp: string
  messages: any[] // We'll type this properly later when we add the database
}

interface ChatContextType {
  sessions: ChatSession[]
  selectedSession: string | null
  addSession: (session: ChatSession) => void
  selectSession: (id: string | null) => void
  addMessageToSession: (sessionId: string, message: any) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions')
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    }
  }, [])

  // Save sessions to localStorage when they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(sessions))
    }
  }, [sessions])

  const addSession = (session: ChatSession) => {
    setSessions(prev => [session, ...prev])
    setSelectedSession(session.id)
  }

  const selectSession = (id: string | null) => {
    setSelectedSession(id)
  }

  const addMessageToSession = (sessionId: string, message: any) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        // Check if message already exists to prevent duplicates
        const messageExists = session.messages.some(
          m => m.type === message.type && 
              m.message.content === message.message.content &&
              m.message.role === message.message.role
        )
        if (!messageExists) {
          return {
            ...session,
            messages: [...session.messages, message]
          }
        }
      }
      return session
    }))
  }

  return (
    <ChatContext.Provider value={{
      sessions,
      selectedSession,
      addSession,
      selectSession,
      addMessageToSession
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
