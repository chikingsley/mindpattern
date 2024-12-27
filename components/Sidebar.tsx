"use client"

import { Button } from "./ui/button"
import { useVoice } from "@humeai/voice-react"
import { useChatContext } from "../app/context/ChatContext"

export default function Sidebar() {
  const { status, connect } = useVoice();
  const { sessions, selectedSession, addSession, selectSession } = useChatContext();

  const handleStartCall = async () => {
    try {
      await connect();
      // Create new session
      const newSession = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        messages: []
      };
      addSession(newSession);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="flex-none p-4">
        <Button 
          className="w-full flex items-center gap-1.5"
          onClick={handleStartCall}
          disabled={status.value === "connected"}
        >
          Start New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-2 space-y-2">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => selectSession(session.id)}
            className={`w-full text-left p-3 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors ${
              selectedSession === session.id ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <div className="font-medium">
              Chat {new Date(session.timestamp).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {session.messages.length} messages
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
