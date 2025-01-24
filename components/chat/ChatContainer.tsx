"use client";

import Messages from "./Messages";
import Controls from "./Controls";
import { useRef } from "react";
import { useChatContext } from "./ChatContext";
import { ChatInputForm } from "./ChatInputForm";

export default function ChatContainer() {
  const ref = useRef<HTMLDivElement>(null);
  const { selectedSession, addSession } = useChatContext();

  // If no session is selected, show empty state
  if (!selectedSession) {
    const handleSubmit = async (text: string) => {
      // Create new session with initial message
      const newSession = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        messages: []
      };
      addSession(newSession);
    };

    const handleStartCall = async () => {
      const newSession = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        messages: []
      };
      addSession(newSession);
    };

    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 p-4">
        <ChatInputForm 
          onSubmit={handleSubmit}
          onStartCall={handleStartCall}
        />
      </div>
    );
  }

  {/* Active Chat UI */}
  return (
    <div className="relative h-full">
      {/* Messages Display */}
      <Messages ref={ref} />
      {/* Chat Controls */}
      <Controls />
    </div>
  );
}