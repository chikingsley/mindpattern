"use client";

import React from 'react';
import { BackgroundGradient } from "@/components/ui/background";
import InsightsPanel from '@/components/insights-panel';
import ChatLanding from '@/components/chat-landing';

export default function TestPage() {
  return (
    <main className="relative min-h-screen">
      <BackgroundGradient variant="subtle" />
      <div>
        <ChatLanding />
        <div className="-mt-16">
          <InsightsPanel />
        </div>
      </div>
    </main>
  );
}