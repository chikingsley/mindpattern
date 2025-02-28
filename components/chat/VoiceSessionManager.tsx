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
  const { sendSessionSettings, status, connect } = useVoice();

  // Log all voice status changes
  useEffect(() => {
    console.log('🎙️ Voice Status Change:', {
      status: status.value,
      reason: status.reason,
      timestamp: new Date().toISOString()
    });

    // Enable WebSocket debug logging
    if (typeof window !== 'undefined') {
      // @ts-ignore - Adding debug property to WebSocket
      window.WebSocket = class extends window.WebSocket {
        constructor(url: string, protocols?: string | string[]) {
          console.log('🔌 WebSocket Connecting:', url);
          super(url, protocols);
          
          this.addEventListener('open', () => {
            console.log('✅ WebSocket Connected');
          });
          
          this.addEventListener('close', (event) => {
            console.log('❌ WebSocket Closed:', {
              code: event.code,
              reason: event.reason,
              wasClean: event.wasClean
            });
          });
          
          this.addEventListener('error', (error) => {
            console.error('🚨 WebSocket Error:', error);
          });
        }
      };
    }
  }, [status]);

  // Handle connection recovery
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    const maxRetries = 3;
    let retryCount = 0;

    const attemptReconnect = async () => {
      if (retryCount >= maxRetries) {
        console.log('❌ Max reconnection attempts reached');
        return;
      }

      try {
        retryCount++;
        console.log(`🔄 Attempting to reconnect voice... (attempt ${retryCount}/${maxRetries})`);
        await connect();
        console.log('✅ Voice reconnected successfully');
        retryCount = 0; // Reset counter on success
      } catch (error) {
        console.error('❌ Voice reconnection failed:', error);
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.min(2000 * Math.pow(2, retryCount - 1), 8000);
        reconnectTimeout = setTimeout(attemptReconnect, delay);
      }
    };

    if (status.value === 'error') {
      console.log('🔌 Voice connection error:', status.reason);
      reconnectTimeout = setTimeout(attemptReconnect, 2000);
    }

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [status, connect]);

  // Handle session settings
  useEffect(() => {
    const handleSessionCreated = async (event: CustomEvent<SessionCreatedDetail>) => {
      try {
        console.log('📝 Preparing to update voice session settings:', {
          sessionId: event.detail.sessionId,
          currentStatus: status.value
        });

        // Only send settings if we're connected
        if (status.value !== 'connected') {
          console.log('⚠️ Cannot update session settings - voice not connected');
          return;
        }

        await sendSessionSettings({
          customSessionId: event.detail.sessionId
        });
        
        console.log('✅ Voice session settings updated successfully');
      } catch (error) {
        console.error('❌ Failed to update voice session settings:', {
          error,
          sessionId: event.detail.sessionId,
          status: status.value
        });
      }
    };

    window.addEventListener(SESSION_CREATED_EVENT, handleSessionCreated);
    return () => window.removeEventListener(SESSION_CREATED_EVENT, handleSessionCreated);
  }, [sendSessionSettings, status.value]);

  return null; // This component doesn't render anything
}
