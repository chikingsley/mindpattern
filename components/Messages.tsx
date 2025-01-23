"use client";

import { cn } from "../lib/utils";
import { useVoice } from "@humeai/voice-react";
import Expressions from "./Expressions";
import { AnimatePresence, motion } from "framer-motion";
import { forwardRef, useEffect, useRef } from "react";
import { useChatContext } from "../app/context/ChatContext";
import type { ChatMessage } from "@/prisma/prisma-types";

const Messages = forwardRef<HTMLDivElement>(function Messages(_, ref) {
  const { messages: voiceMessages } = useVoice();
  const { 
    selectedSession,
    activeSessionId,
    addMessageToSession, 
    sessions,
    isActiveSession 
  } = useChatContext();
  const lastMessageRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Save new messages to current session
  useEffect(() => {
    if (!activeSessionId || !isActiveSession(activeSessionId)) {
      console.debug('No active session, skipping message:', voiceMessages[voiceMessages.length - 1]?.type);
      return;
    }

    if (voiceMessages.length > 0) {
      const lastMessage = voiceMessages[voiceMessages.length - 1];
      if (
        (lastMessage.type === "user_message" || lastMessage.type === "assistant_message") &&
        lastMessage.message?.content &&
        JSON.stringify(lastMessage) !== lastMessageRef.current
      ) {
        console.debug('Adding message to active session:', {
          sessionId: activeSessionId,
          messageType: lastMessage.type,
          content: lastMessage.message.content.slice(0, 50) + '...'
        });

        lastMessageRef.current = JSON.stringify(lastMessage);
        
        // Map the role to allowed values
        const role = lastMessage.message.role === 'system' ? 'assistant' : 
                    (lastMessage.message.role as 'user' | 'assistant');

        addMessageToSession(activeSessionId, {
          role,
          content: lastMessage.message.content,
          timestamp: new Date().toISOString(),
          metadata: {
            prosody: lastMessage.models?.prosody?.scores ? 
              Object.fromEntries(
                Object.entries(lastMessage.models.prosody.scores)
                  .map(([key, value]) => {
                    const numValue = typeof value === 'string' ? parseFloat(value) : value;
                    return [key, isNaN(numValue) ? 0 : numValue];
                  })
              ) : undefined
          }
        });

        // Use requestAnimationFrame for scrolling to avoid hydration issues
        if (scrollRef.current) {
          requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: 'smooth'
            });
          });
        }
      }
    }
  }, [voiceMessages, activeSessionId, addMessageToSession, isActiveSession]);

  // Get current session messages
  const currentMessages = activeSessionId 
    ? sessions.find(s => s.id === activeSessionId)?.messages || []
    : [];

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) return '';
      
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  // Debug logging
  console.debug('Current session:', {
    id: activeSessionId,
    messageCount: currentMessages.length,
    messages: currentMessages.map(m => ({
      role: m.role,
      content: m.content ? m.content.substring(0, 50) + '...' : '[No content]',
      timestamp: m.timestamp,
      metadata: m.metadata
    }))
  });

  // If messages can't be loaded for an existing chat, show error state
  const session = sessions.find(s => s.id === activeSessionId);
  if (activeSessionId && !currentMessages.length && session?.messages?.length) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-y-auto pb-32">
        <div className="max-w-2xl mx-auto p-4 flex items-center justify-center h-full text-muted-foreground">
          Unable to load chat history. Try refreshing the page.
        </div>
      </div>
    );
  }

  const shouldScroll = () => {
    if (!scrollRef.current || !contentRef.current) return false;
    return contentRef.current.scrollHeight > scrollRef.current.clientHeight;
  };

  // Scroll to bottom when session changes, only if content is taller than viewport
  useEffect(() => {
    if (scrollRef.current && activeSessionId && shouldScroll()) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'instant'
      });
    }
  }, [activeSessionId]);

  // Smooth scroll for new messages in active session
  useEffect(() => {
    if (scrollRef.current && currentMessages.length > 0 && activeSessionId && isActiveSession(activeSessionId) && shouldScroll()) {
      const microphoneHeight = 80;
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight + microphoneHeight,
        behavior: 'smooth'
      });
    }
  }, [currentMessages.length, activeSessionId, isActiveSession]);

  return (
    <div 
      ref={scrollRef}
      className="h-[calc(100vh-4rem)] overflow-y-auto pb-40"
    >
      <div 
        ref={contentRef}
        className="max-w-2xl mx-auto p-4 space-y-4 min-h-0"
      >
        <AnimatePresence initial={false}>
          {currentMessages.map((msg, index) => {
            const shouldAnimate = activeSessionId && isActiveSession(activeSessionId) && shouldScroll();
            return (
              <motion.div
                key={`${activeSessionId}-${msg.role}-${index}-${msg.timestamp}`}
                style={{
                  width: '80%',
                  marginLeft: msg.role === "user" ? "auto" : undefined,
                  marginRight: msg.role === "user" ? undefined : "auto"
                }}
                {...(shouldAnimate
                  ? {
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      exit: { opacity: 0, y: -20 },
                      transition: { duration: 0.2 }
                    }
                  : { animate: { opacity: 1 } }
                )}
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
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
});

Messages.displayName = "Messages";

export default Messages;
