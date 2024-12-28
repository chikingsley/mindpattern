"use client";
import { cn } from "../lib/utils";
import { useVoice } from "@humeai/voice-react";
import Expressions from "./Expressions";
import { AnimatePresence, motion } from "framer-motion";
import { forwardRef, useEffect, useRef } from "react";
import { useChatContext } from "../app/context/ChatContext";
import type { ChatMessage } from "@/types/database";

const Messages = forwardRef<HTMLDivElement>(function Messages(_, ref) {
  const { messages: voiceMessages } = useVoice();
  const { selectedSession, addMessageToSession, sessions } = useChatContext();
  const lastMessageRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Save new messages to current session
  useEffect(() => {
    if (selectedSession && voiceMessages.length > 0) {
      const lastMessage = voiceMessages[voiceMessages.length - 1];
      if (
        (lastMessage.type === "user_message" || lastMessage.type === "assistant_message") &&
        JSON.stringify(lastMessage) !== lastMessageRef.current
      ) {
        lastMessageRef.current = JSON.stringify(lastMessage);
        addMessageToSession(selectedSession, {
          role: lastMessage.message.role,
          content: lastMessage.message.content,
          timestamp: new Date().toISOString(),
          metadata: {
            prosody: lastMessage.models?.prosody?.scores
          }
        });

        // Scroll to bottom after adding new message
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [voiceMessages, selectedSession, addMessageToSession]);

  // Get messages for selected session
  const currentSession = sessions.find(s => s.id === selectedSession);
  const currentMessages = currentSession?.messages || [];

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Debug logging
  console.debug('Current session:', {
    id: selectedSession,
    messageCount: currentMessages.length,
    messages: currentMessages.map(m => ({
      role: m.role,
      content: m.content.substring(0, 50) + '...',
      timestamp: m.timestamp,
      metadata: m.metadata
    }))
  });

  return (
    <div 
      ref={scrollRef}
      className="h-[calc(100vh-4rem)] overflow-y-auto pb-32"
    >
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {currentMessages.map((msg, index) => (
            <motion.div
              key={`${selectedSession}-${msg.role}-${index}-${msg.timestamp}`}
              style={{
                width: '80%',
                marginLeft: msg.role === "user" ? "auto" : undefined,
                marginRight: msg.role === "user" ? undefined : "auto"
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <div
                className={cn(
                  "rounded-lg border bg-card p-4",
                  msg.role === "user" ? "rounded-br-none" : "rounded-bl-none"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs capitalize font-medium leading-none opacity-50">
                    {msg.role}
                  </div>
                  <div className="text-xs opacity-50">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
                <div className="break-words whitespace-pre-wrap">{msg.content}</div>
                {msg.metadata?.prosody && (
                  <div className="mt-2">
                    <Expressions values={msg.metadata.prosody} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

Messages.displayName = "Messages";

export default Messages;
