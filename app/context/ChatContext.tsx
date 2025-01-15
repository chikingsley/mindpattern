"use client";
/**
 * Chat Context Flow:
 * 
 * 1. Data Storage Strategy:
 *    - Primary: Prisma Database (PostgreSQL)
 *    - Fallback: Browser's localStorage
 * 
 * 2. Session Loading Flow:
 *    a. When component mounts, check if user is authenticated
 *    b. If authenticated:
 *       - Try to load sessions from Prisma
 *       - If Prisma fails, fall back to localStorage
 *    c. If not authenticated:
 *       - Wait for auth state to load
 * 
 * 3. Session Management:
 *    - New sessions are created locally first
 *    - Then synced to backend asynchronously
 *    - Active session tracking with timeout
 *    - Messages are added to local state immediately
 *    - Then synced to backend asynchronously
 * 
 * 4. State Updates:
 *    - Local state updates are immediate for UI responsiveness
 *    - Backend sync happens in background
 *    - Error states are tracked for fallback behavior
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { ChatMessage } from '@/types/database'
import { useSession } from '@clerk/nextjs'

// Basic chat session structure
interface ChatSession {
  id: string
  timestamp: string
  messages: ChatMessage[]
}

// Complete context interface defining all available operations
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

// Time before a session is considered inactive
const ACTIVE_SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  // Core state management
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [lastMessageTime, setLastMessageTime] = useState<number | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { session, isLoaded } = useSession()

  // Background sync functions for eventual consistency
  const syncSessionToBackend = async (newSession: ChatSession) => {
    if (!session?.user?.id) return;

    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newSession.id,
          timestamp: newSession.timestamp,
          userId: session.user.id
        })
      });
    } catch (error) {
      console.error('Background session sync failed:', error);
      // Don't set error state here as this is a background operation
    }
  };

  const syncMessageToBackend = async (sessionId: string, message: ChatMessage) => {
    if (!session?.user?.id) return;

    try {
      await fetch(`/api/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: message.role,
          content: message.content,
          timestamp: message.timestamp,
          metadata: message.metadata
        })
      });
    } catch (error) {
      console.error('Background message sync failed:', error);
      // Don't set error state here as this is a background operation
    }
  };

  // Fallback data loading from localStorage
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

  // Primary initialization effect
  useEffect(() => {
    const loadSessions = async () => {
      if (!session?.user?.id) return;
      
      try {
        console.debug('Loading from Prisma...');
        const response = await fetch('/api/sessions');
        if (!response.ok) throw new Error('Failed to fetch from Prisma');
        
        const data = await response.json();
        console.debug('Loaded from Prisma:', data.length, 'sessions');
        // Clear localStorage when we successfully load from Prisma
        localStorage.removeItem('chatSessions');
        setSessions(data);
      } catch (error) {
        setError(error as Error);
        console.error('Failed to load from Prisma:', error);
        console.debug('Falling back to localStorage...');
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded) {
      loadSessions();
    }
  }, [isLoaded, session?.user?.id]);

  // Fallback persistence to localStorage
  useEffect(() => {
    if (sessions.length > 0 && error) {
      console.debug('Saving to localStorage:', sessions.length, 'sessions')
      localStorage.setItem('chatSessions', JSON.stringify(sessions))
    }
  }, [sessions, error]);

  // Session management functions
  const addSession = async (newSession: ChatSession) => {
    console.debug('Adding new session:', newSession.id);
    
    // Optimistic UI update
    setSessions(prev => [newSession, ...prev]);
    setSelectedSession(newSession.id);
    setActiveSessionId(newSession.id);
    setLastMessageTime(Date.now());

    // Background sync
    syncSessionToBackend(newSession);
  };

  const selectSession = (id: string | null) => {
    setSelectedSession(id);
    if (id !== activeSessionId) {
      setActiveSessionId(id);
      setLastMessageTime(Date.now());
    }
  };

  const addMessageToSession = async (sessionId: string, message: ChatMessage) => {
    console.debug('Adding message to session:', sessionId);
    
    // Optimistic UI update
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          messages: [...session.messages, message]
        };
      }
      return session;
    }));

    // Update active session state
    setActiveSessionId(sessionId);
    setLastMessageTime(Date.now());

    // Background sync
    syncMessageToBackend(sessionId, message);
  };

  // Active session check with timeout
  const isActiveSession = (sessionId: string): boolean => {
    if (sessionId !== activeSessionId) return false;
    if (!lastMessageTime) return false;
    
    const timeSinceLastMessage = Date.now() - lastMessageTime;
    return timeSinceLastMessage < ACTIVE_SESSION_TIMEOUT;
  };

  // Provide context value
  const value = {
    sessions,
    selectedSession,
    activeSessionId,
    lastMessageTime,
    addSession,
    selectSession,
    addMessageToSession,
    isActiveSession,
    error,
    isLoading
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook for using chat context
export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
