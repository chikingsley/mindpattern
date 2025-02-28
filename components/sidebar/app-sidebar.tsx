"use client"

import * as React from "react"
import { useVoice } from "@humeai/voice-react"
import { useChatContext } from "../chat/ChatContext"
import { Button } from "@/components/ui/button"
import { NavConversations } from "@/components/sidebar/nav-conversations"
import { NavUser } from "@/components/sidebar/nav-user"
import { NavLogo } from "@/components/sidebar/nav-logo"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { SESSION_CREATED_EVENT } from "@/components/chat/VoiceSessionManager"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { status, connect } = useVoice();
  const { addSession } = useChatContext();

  const handleStartCall = async () => {
    try {
      // Create new session
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const newSession = await response.json();
      addSession(newSession);

      // Notify VoiceSessionManager
      window.dispatchEvent(new CustomEvent(SESSION_CREATED_EVENT, {
        detail: { sessionId: newSession.id }
      }));

      // Attempt voice connection
      await connect();
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      side="left"
      variant="sidebar"
      {...props}
    >
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <div className="flex-none p-2">
          <Button 
            className="w-full flex items-center gap-1.5"
            onClick={handleStartCall}
            disabled={status.value === "connected"}
          >
            Start New Chat {status.value !== "connected" ? "" : "(Connected)"}
          </Button>
        </div>
        <NavConversations />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}