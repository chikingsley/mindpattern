"use client";

import { useEffect } from 'react';
import { useVoice } from '@humeai/voice-react';

// Custom event for session creation
export const SESSION_CREATED_EVENT = 'sessionCreated';

export interface SessionCreatedDetail {
  sessionId: string;
}

declare global {
  interface WindowEventMap {
    [SESSION_CREATED_EVENT]: CustomEvent<SessionCreatedDetail>;
  }
}

export function VoiceSessionManager() {
  const { sendSessionSettings } = useVoice();

  useEffect(() => {
    const handleSessionCreated = (event: CustomEvent<SessionCreatedDetail>) => {
      sendSessionSettings({
        customSessionId: event.detail.sessionId
      });
    };

    // Listen for session created events
    window.addEventListener(SESSION_CREATED_EVENT, handleSessionCreated);

    return () => {
      window.removeEventListener(SESSION_CREATED_EVENT, handleSessionCreated);
    };
  }, [sendSessionSettings]);

  return null; // This component doesn't render anything
}
