"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useDatabaseService } from '@/services/DatabaseService'
import { retry } from '@/utils/retry'
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
  addSession: (session: ChatSession) => void
  selectSession: (id: string | null) => void
  addMessageToSession: (sessionId: string, message: ChatMessage) => void
  error: Error | null
  isLoading: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { session, isLoaded } = useSession()
  const databaseService = useDatabaseService()

  // Initialize user and load data
  useEffect(() => {
    const initializeData = async () => {
      if (!isLoaded) return
      
      try {
        if (session?.user) {
          console.debug('Loading data for user:', session.user.id)
          await loadData(session.user.id)
        } else {
          console.debug('No user session, loading from localStorage only')
          loadFromLocalStorage()
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Failed to initialize data:', {
          error,
          message: errorMessage,
          userId: session?.user?.id
        })
        setError(error as Error)
        loadFromLocalStorage() // Fallback to localStorage
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [session, isLoaded])

  // Load data from both sources
  const loadData = async (uid: string) => {
    try {
      // Load from localStorage first for immediate display
      loadFromLocalStorage()
      
      console.debug('Fetching interactions from Supabase for user:', uid)
      // Then load from Supabase
      const interactions = await retry(() => 
        databaseService.getInteractionsByUser(uid)
      )

      if (!interactions) {
        console.warn('No interactions returned from Supabase')
        return
      }

      console.debug('Received interactions:', interactions.length)
      
      // Convert Supabase data to ChatSession format
      const supabaseSessions = groupInteractionsIntoSessions(interactions)
      console.debug('Grouped into sessions:', supabaseSessions.length)
      
      // Merge with existing sessions
      setSessions(prev => mergeSessions(prev, supabaseSessions))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to load from Supabase:', {
        error,
        message: errorMessage,
        userId: uid
      })
      setError(error as Error)
    }
  }

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
    // Update local state immediately
    setSessions(prev => [newSession, ...prev])
    setSelectedSession(newSession.id)

    // Save to Supabase if user is authenticated
    if (session?.user) {
      try {
        console.debug('Saving session to Supabase:', newSession.id)
        await retry(() => 
          databaseService.createInteraction({
            user_id: session.user.id,
            input_type: 'text',
            content: JSON.stringify(newSession),
            session_id: newSession.id
          })
        )
      } catch (error) {
        console.error('Failed to save session to Supabase:', {
          error,
          sessionId: newSession.id,
          userId: session.user.id
        })
      }
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
            console.debug('Adding new message to session:', sessionId)
            return {
              ...session,
              messages: [...session.messages, message],
              timestamp: message.timestamp // Update session timestamp
            }
          }
          console.debug('Message already exists in session:', sessionId)
        }
        return session
      })

      // Log the updated session
      const updatedSession = updatedSessions.find(s => s.id === sessionId)
      console.debug('Updated session:', {
        id: sessionId,
        messageCount: updatedSession?.messages.length
      })

      return updatedSessions
    })

    // Save to Supabase if user is authenticated
    if (session?.user) {
      try {
        console.debug('Saving message to Supabase:', {
          sessionId,
          messageRole: message.role
        })
        await retry(() => 
          databaseService.createInteraction({
            user_id: session.user.id,
            input_type: 'text',
            content: message.content,
            session_id: sessionId
          })
        )
      } catch (error) {
        console.error('Failed to save message to Supabase:', {
          error,
          sessionId,
          userId: session.user.id
        })
      }
    }
  }

  const selectSession = (id: string | null) => {
    console.debug('Selecting session:', id)
    setSelectedSession(id)
  }

  // Helper function to group interactions into sessions
  const groupInteractionsIntoSessions = (interactions: any[]) => {
    console.debug('Grouping interactions into sessions:', interactions.length)
    const sessionMap = new Map<string, ChatSession>()
    
    for (const interaction of interactions) {
      const sessionId = interaction.session_id
      if (!sessionId) {
        console.warn('Interaction missing session_id:', interaction)
        continue
      }

      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          id: sessionId,
          timestamp: interaction.timestamp,
          messages: []
        })
      }

      const session = sessionMap.get(sessionId)!
      session.messages.push({
        role: interaction.metadata?.role || 'user',
        content: interaction.content,
        timestamp: interaction.timestamp
      })
    }

    return Array.from(sessionMap.values())
  }

  // Helper function to merge sessions without duplicates
  const mergeSessions = (localSessions: ChatSession[], remoteSessions: ChatSession[]) => {
    console.debug('Merging sessions:', {
      local: localSessions.length,
      remote: remoteSessions.length
    })
    
    const sessionMap = new Map<string, ChatSession>()
    
    // Add local sessions first
    localSessions.forEach(session => {
      sessionMap.set(session.id, session)
    })

    // Add remote sessions, overwriting local ones if they exist
    remoteSessions.forEach(session => {
      if (!sessionMap.has(session.id)) {
        sessionMap.set(session.id, session)
      }
    })

    const mergedSessions = Array.from(sessionMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    console.debug('Merged sessions result:', mergedSessions.length)
    return mergedSessions
  }

  return (
    <ChatContext.Provider value={{
      sessions,
      selectedSession,
      addSession,
      selectSession,
      addMessageToSession,
      error,
      isLoading
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
