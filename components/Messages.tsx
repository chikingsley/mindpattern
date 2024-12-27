"use client";
import { cn } from "../lib/utils";
import { useVoice } from "@humeai/voice-react";
import Expressions from "./Expressions";
import { AnimatePresence, motion } from "framer-motion";
import { forwardRef, useEffect, useRef } from "react";
import { useChatContext } from "../app/context/ChatContext";

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
          type: lastMessage.type,
          message: lastMessage.message,
          models: lastMessage.models
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

  // Get messages for selected session or current voice messages
  const currentSessionMessages = selectedSession 
    ? sessions.find(s => s.id === selectedSession)?.messages || []
    : voiceMessages;

  return (
    <div 
      ref={scrollRef}
      className="h-[calc(100vh-4rem)] overflow-y-auto pb-32"
    >
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {currentSessionMessages.map((msg, index) => {
          if (
            msg.type === "user_message" ||
            msg.type === "assistant_message"
          ) {
            return (
              <motion.div
                key={`${selectedSession || 'current'}-${msg.type}-${index}`}
                style={{
                  width: '80%',
                  marginLeft: msg.type === "user_message" ? "auto" : undefined,
                  marginRight: msg.type === "user_message" ? undefined : "auto"
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
                    msg.type === "user_message" ? "rounded-br-none" : "rounded-bl-none"
                  )}
                >
                  <div className="text-xs capitalize font-medium leading-none opacity-50 mb-2">
                    {msg.message.role}
                  </div>
                  <div className="break-words">{msg.message.content}</div>
                  <Expressions values={{ ...msg.models.prosody?.scores }} />
                </div>
              </motion.div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
});

Messages.displayName = "Messages";

export default Messages;
