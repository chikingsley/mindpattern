"use client"

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

interface Message {
  id: string
  role: string
  content: string
  timestamp: string
}

interface Session {
  id: string
  messages: Message[]
}

const STORAGE_KEY = 'test-sessions'

export default function TestSessionsPage() {
  const { user } = useUser()
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load from localStorage first, then sync with DB
  useEffect(() => {
    if (!user) return

    // Load from localStorage first
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const localSessions = JSON.parse(stored)
        setSessions(localSessions)
        setLoading(false)
      } catch (err) {
        console.error('Failed to parse localStorage:', err)
      }
    }

    // Then sync with DB
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setSessions(prev => mergeSessions(prev, data))
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load sessions:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [user])

  // Save to localStorage when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    }
  }, [sessions])

  // Create new session
  const createSession = async () => {
    try {
      // Create optimistic session
      const optimisticId = 'temp-' + Date.now()
      const optimisticSession = {
        id: optimisticId,
        messages: []
      }
      setSessions(prev => [optimisticSession, ...prev])

      // Create in DB
      const res = await fetch('/api/sessions', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      // Replace optimistic with real
      setSessions(prev => [
        data,
        ...prev.filter(s => s.id !== optimisticId)
      ])
      setCurrentSession(data.id)
    } catch (err) {
      console.error('Failed to create session:', err)
      setError(err instanceof Error ? err.message : 'Failed to create session')
      // Remove optimistic session on error
      setSessions(prev => prev.filter(s => s.id !== optimisticId))
    }
  }

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSession || !message.trim()) return
    
    // Don't send if session is temporary
    if (currentSession.startsWith('temp-')) {
      console.warn('Cannot send message to temporary session')
      return
    }

    // Create optimistic message
    const optimisticMessage = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    }

    // Update UI immediately
    setSessions(prev => prev.map(session => {
      if (session.id === currentSession) {
        return {
          ...session,
          messages: [...session.messages, optimisticMessage]
        }
      }
      return session
    }))
    setMessage('')

    try {
      // Send to DB
      const res = await fetch(`/api/sessions/${currentSession}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          role: 'user',
          content: optimisticMessage.content
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Replace optimistic with real
      setSessions(prev => prev.map(session => {
        if (session.id === currentSession) {
          return {
            ...session,
            messages: session.messages.map(msg => 
              msg.id === optimisticMessage.id ? data : msg
            )
          }
        }
        return session
      }))
    } catch (err) {
      console.error('Failed to send message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      
      // Remove optimistic on error
      setSessions(prev => prev.map(session => {
        if (session.id === currentSession) {
          return {
            ...session,
            messages: session.messages.filter(msg => msg.id !== optimisticMessage.id)
          }
        }
        return session
      }))
    }
  }

  // Merge local and DB sessions, preferring newer messages
  const mergeSessions = (local: Session[], remote: Session[]): Session[] => {
    const merged = new Map<string, Session>()
    
    // Add all local sessions first
    local.forEach(session => merged.set(session.id, session))
    
    // Merge in remote sessions
    remote.forEach(session => {
      const existing = merged.get(session.id)
      if (!existing) {
        merged.set(session.id, session)
        return
      }

      // Merge messages, preferring newer ones
      const messages = new Map<string, Message>()
      existing.messages.forEach(msg => messages.set(msg.id, msg))
      session.messages.forEach(msg => {
        const existingMsg = messages.get(msg.id)
        if (!existingMsg || new Date(msg.timestamp) > new Date(existingMsg.timestamp)) {
          messages.set(msg.id, msg)
        }
      })

      merged.set(session.id, {
        ...session,
        messages: Array.from(messages.values()).sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      })
    })

    return Array.from(merged.values())
  }

  if (!user) return <div className="p-4">Please sign in</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Sessions</h1>
      
      <button
        onClick={createSession}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        New Session
      </button>

      <div className="grid grid-cols-3 gap-4">
        {/* Sessions list */}
        <div className="border rounded p-4">
          <h2 className="font-bold mb-2">Sessions</h2>
          {loading ? (
            // Session skeletons
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded mb-2" />
              </div>
            ))
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                onClick={() => setCurrentSession(session.id)}
                className={`p-2 mb-2 rounded cursor-pointer ${
                  currentSession === session.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
              >
                Session {session.id.slice(0, 8)}...
                <div className="text-sm text-gray-500">
                  {session.messages.length} messages
                </div>
              </div>
            ))
          )}
        </div>

        {/* Messages */}
        <div className="col-span-2 border rounded p-4">
          <h2 className="font-bold mb-2">Messages</h2>
          {currentSession ? (
            <>
              <div className="mb-4 space-y-2">
                {sessions
                  .find(s => s.id === currentSession)
                  ?.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded ${
                        msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                      } ${msg.id.startsWith('temp-') ? 'opacity-50' : ''}`}
                    >
                      <div className="text-sm text-gray-500">{msg.role}</div>
                      {msg.content}
                    </div>
                  ))}
              </div>
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="flex-1 border rounded px-2 py-1"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-1 rounded"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="text-gray-500">Select a session</div>
          )}
        </div>
      </div>
    </div>
  )
}
