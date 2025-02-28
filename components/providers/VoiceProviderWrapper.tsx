"use client";

import { VoiceProvider } from "@humeai/voice-react";
import { ReactNode, useCallback } from "react";

interface VoiceProviderWrapperProps {
  auth: {
    type: "accessToken";
    value: string;
  };
  configId: string;
  sessionSettings?: {
    type: "session_settings";
    systemPrompt?: string;
    languageModelApiKey?: string;
  };
  children: ReactNode;
}

export function VoiceProviderWrapper({
  auth,
  configId,
  sessionSettings,
  children,
}: VoiceProviderWrapperProps) {
  const handleError = useCallback((error: any) => {
    console.error('🚨 VoiceProvider Error:', {
      error,
      errorType: typeof error,
      errorKeys: Object.keys(error),
      stack: error?.stack,
      configId,
      hasAuth: !!auth?.value,
      hasSessionSettings: !!sessionSettings,
      timestamp: new Date().toISOString()
    });
  }, [auth?.value, configId, sessionSettings]);

  return (
    <VoiceProvider
      auth={auth}
      configId={configId}
      sessionSettings={sessionSettings}
      onError={handleError}
      onStateChange={(state) => {
        console.log('🎙️ Voice State Change:', {
          state,
          configId,
          timestamp: new Date().toISOString()
        });
      }}
    >
      {children}
    </VoiceProvider>
  );
} 