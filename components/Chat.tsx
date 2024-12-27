"use client";

import Messages from "./Messages";
import Controls from "./Controls";
import { useRef } from "react";
import { useChatContext } from "../app/context/ChatContext";

export default function Chat() {
  const timeout = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { selectedSession } = useChatContext();

  // If no session is selected, show empty state
  if (!selectedSession) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a chat or start a new one
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      <div className="absolute inset-0">
        <Messages ref={ref} />
      </div>
      <Controls />
    </div>
  );
}
