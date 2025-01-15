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

export default function TestSessionsPage() {
  const { user } = useUser()
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load sessions
  useEffect(() => {
    if (!user) return

    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setSessions(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load sessions:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [user])

  // Create new session
  const createSession = async () => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST'
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      setSessions(prev => [data, ...prev])
      setCurrentSession(data.id)
    } catch (err) {
      console.error('Failed to create session:', err)
      setError(err instanceof Error ? err.message : 'Failed to create session')
    }
  }

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSession || !message.trim()) return

    try {
      const res = await fetch(`/api/sessions/${currentSession}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          role: 'user',
          content: message
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Update sessions with new message
      setSessions(prev => prev.map(session => {
        if (session.id === currentSession) {
          return {
            ...session,
            messages: [...session.messages, data]
          }
        }
        return session
      }))
      setMessage('')
    } catch (err) {
      console.error('Failed to send message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }

  if (!user) return <div className="p-4">Please sign in</div>
  if (loading) return <div className="p-4">Loading...</div>
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
          {sessions.map(session => (
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
          ))}
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
                      }`}
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
