"use client";
import { cn } from "@/utils";
import { useVoice } from "@humeai/voice-react";
import Expressions from "./Expressions";
import { AnimatePresence, motion } from "framer-motion";
import { forwardRef } from "react";

const containerStyle = {
  flexGrow: 1,
  borderRadius: "0.375rem",
  overflow: "auto",
  padding: "1rem"
};

const messagesStyle = {
  maxWidth: "42rem",
  marginLeft: "auto",
  marginRight: "auto",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  paddingBottom: "6rem"
} as const;

const Messages = forwardRef<HTMLDivElement>(function Messages(_, ref) {
  const { messages } = useVoice();

  return (
    <motion.div
      layoutScroll
      style={containerStyle}
      ref={ref}
    >
      <motion.div
        style={messagesStyle}
      >
        <AnimatePresence mode={"popLayout"}>
          {messages.map((msg, index) => {
            if (
              msg.type === "user_message" ||
              msg.type === "assistant_message"
            ) {
              return (
                <motion.div
                  key={msg.type + index}
                  style={{
                    width: "80%",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.375rem",
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
                    y: 0,
                  }}
                >
                  <div
                    className={cn(
                      "text-xs capitalize font-medium leading-none opacity-50 pt-4 px-3"
                    )}
                  >
                    {msg.message.role}
                  </div>
                  <div className={"pb-3 px-3"}>{msg.message.content}</div>
                  <Expressions values={{ ...msg.models.prosody?.scores }} />
                </motion.div>
              );
            }

            return null;
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});

export default Messages;
