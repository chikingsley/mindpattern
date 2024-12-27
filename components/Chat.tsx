"use client";

import Messages from "./Messages";
import Controls from "./Controls";
import { useRef } from "react";
import { useChatContext } from "../app/context/ChatContext";

export default function Chat() {
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
    <div className="relative h-full">
      <Messages ref={ref} />
      <Controls />
    </div>
  );
}
