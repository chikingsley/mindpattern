"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { ChatMessage } from '@/types/database'
import { useSession } from '@clerk/nextjs'

interface ChatSession {
  id: string
  timestamp: string
  messages: ChatMessage[]
}

interface ChatContextType {
  sessions: ChatSession[]
  selectedSession: string | null
  activeSessionId: string | null
  lastMessageTime: number | null
  addSession: (session: ChatSession) => void
  selectSession: (id: string | null) => void
  addMessageToSession: (sessionId: string, message: ChatMessage) => void
  isActiveSession: (sessionId: string) => boolean
  error: Error | null
  isLoading: boolean
}

const ACTIVE_SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [lastMessageTime, setLastMessageTime] = useState<number | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { session, isLoaded } = useSession()

  // Initialize user and load data
  useEffect(() => {
    const initializeData = async () => {
      if (!isLoaded) return
      
      try {
        console.debug('Loading from localStorage')
        loadFromLocalStorage()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Failed to initialize data:', {
          error,
          message: errorMessage
        })
        setError(error as Error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [isLoaded])

  // Load from localStorage
  const loadFromLocalStorage = () => {
    try {
      const savedSessions = localStorage.getItem('chatSessions')
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions)
        console.debug('Loaded from localStorage:', parsed.length, 'sessions')
        setSessions(parsed)
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
  }

  // Save to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      console.debug('Saving to localStorage:', sessions.length, 'sessions')
      localStorage.setItem('chatSessions', JSON.stringify(sessions))
    }
  }, [sessions])

  const addSession = async (newSession: ChatSession) => {
    console.debug('Adding new session:', newSession.id)
    setSessions(prev => [newSession, ...prev])
    setSelectedSession(newSession.id)
    setActiveSessionId(newSession.id)
    setLastMessageTime(Date.now())
  }

  const selectSession = (id: string | null) => {
    setSelectedSession(id)
    // Clear active session when switching
    if (id !== activeSessionId) {
      setActiveSessionId(null)
      setLastMessageTime(null)
    }
  }

  const addMessageToSession = async (sessionId: string, message: ChatMessage) => {
    console.debug('Adding message to session:', {
      sessionId,
      message: {
        role: message.role,
        content: message.content.substring(0, 50) + '...',
        timestamp: message.timestamp
      }
    })

    // Update active session tracking
    setActiveSessionId(sessionId)
    setLastMessageTime(Date.now())

    // Update local state immediately
    setSessions(prev => {
      const updatedSessions = prev.map(session => {
        if (session.id === sessionId) {
          // Check if message already exists
          const messageExists = session.messages.some(
            m => m.role === message.role && 
                m.content === message.content &&
                m.timestamp === message.timestamp
          )
          
          if (!messageExists) {
            return {
              ...session,
              messages: [...session.messages, message]
            }
          }
        }
        return session
      })
      
      return updatedSessions
    })
  }

  const isActiveSession = (sessionId: string) => {
    return (
      sessionId === activeSessionId &&
      lastMessageTime !== null &&
      Date.now() - lastMessageTime < ACTIVE_SESSION_TIMEOUT
    )
  }

  return (
    <ChatContext.Provider
      value={{
        sessions,
        selectedSession,
        activeSessionId,
        lastMessageTime,
        addSession,
        selectSession,
        addMessageToSession,
        isActiveSession,
        error,
        isLoading,
      }}
    >
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
