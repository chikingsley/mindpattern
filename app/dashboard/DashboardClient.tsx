"use client";

import dynamic from "next/dynamic";

// Dynamically import the chat component with SSR disabled
const ChatContainer = dynamic(() => import("@/components/chat/ChatContainer"), {
  ssr: false,
  loading: () => <div>Loading chat...</div>
});

export function DashboardClient() {
  return <ChatContainer />;
} 