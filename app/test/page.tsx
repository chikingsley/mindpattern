"use client";

import ChatLanding from "@/components/chat-landing";
import { BackgroundGradient } from "@/components/ui/background";

export default function Page() {
  return (
    <main className="relative">
      <BackgroundGradient variant="landing" />
      <ChatLanding />
    </main>
  );
}