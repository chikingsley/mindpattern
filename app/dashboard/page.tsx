import dynamic from "next/dynamic";
import { Suspense } from "react";

export const runtime = 'nodejs';

// Dynamically import the chat component
const ChatContainer = dynamic(() => import("@/components/chat/ChatContainer"), {
  loading: () => <div>Loading...</div>
});

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContainer />
    </Suspense>
  );
}
