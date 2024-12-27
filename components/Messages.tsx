"use client";
import { cn } from "../lib/utils";
import { useVoice } from "@humeai/voice-react";
import Expressions from "./Expressions";
import { AnimatePresence, motion } from "framer-motion";
import { forwardRef, useEffect, useRef } from "react";
import { useChatContext } from "../app/context/ChatContext";

const messagesStyle = {
  maxWidth: "48rem",
  marginLeft: "auto",
  marginRight: "auto",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
} as const;

const Messages = forwardRef<HTMLDivElement>(function Messages(_, ref) {
  const { messages: voiceMessages } = useVoice();
  const { selectedSession, addMessageToSession, sessions } = useChatContext();
  const lastMessageRef = useRef<string | null>(null);

  // Save new messages to current session
  useEffect(() => {
    if (selectedSession && voiceMessages.length > 0) {
      const lastMessage = voiceMessages[voiceMessages.length - 1];
      if (
        (lastMessage.type === "user_message" || lastMessage.type === "assistant_message") &&
        // Only add if it's a new message
        JSON.stringify(lastMessage) !== lastMessageRef.current
      ) {
        lastMessageRef.current = JSON.stringify(lastMessage);
        addMessageToSession(selectedSession, {
          type: lastMessage.type,
          message: lastMessage.message,
          models: lastMessage.models
        });
      }
    }
  }, [voiceMessages, selectedSession, addMessageToSession]);

  // Get messages for selected session or current voice messages
  const currentSessionMessages = selectedSession 
    ? sessions.find(s => s.id === selectedSession)?.messages || []
    : voiceMessages;

  return (
    <div ref={ref} className="h-full overflow-auto pb-32">
      <div
        style={messagesStyle}
        className="px-4"
      >
        <AnimatePresence mode={"popLayout"} initial={false}>
          {currentSessionMessages.map((msg, index) => {
            if (
              msg.type === "user_message" ||
              msg.type === "assistant_message"
            ) {
              return (
                <motion.div
                  key={`${selectedSession || 'current'}-${msg.type}-${index}`}
                  style={{
                    width: "80%",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    marginLeft: msg.type === "user_message" ? "auto" : "0"
                  }}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  transition={{
                    duration: 0.2
                  }}
                  layout
                >
                  <div
                    className={cn(
                      "text-xs capitalize font-medium leading-none opacity-50 pt-4 px-4"
                    )}
                  >
                    {msg.message.role}
                  </div>
                  <div className={"pb-3 px-4"}>{msg.message.content}</div>
                  <Expressions values={{ ...msg.models.prosody?.scores }} />
                </motion.div>
              );
            }

            return null;
          })}
        </AnimatePresence>
      </div>
    </div>
  );
});

Messages.displayName = "Messages";

export default Messages;
