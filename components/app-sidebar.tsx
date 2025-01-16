"use client"

import * as React from "react"
import { GalleryVerticalEnd } from "lucide-react"
import { useVoice } from "@humeai/voice-react"
import { useChatContext } from "@/app/context/ChatContext"
import { Button } from "@/components/ui/button"
import { NavConversations } from "@/components/nav-conversations"
// import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  // user: {
  //   name: "shadcn",
  //   email: "m@example.com",
  //   avatar: "https://github.com/shadcn.png",
  // },
  teams: [
    {
      name: "Personal",
      logo: GalleryVerticalEnd,
      plan: "Free",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { status, connect } = useVoice();
  const { addSession } = useChatContext();

  // Log voice hook state changes
  React.useEffect(() => {
    console.log('Voice hook status:', {
      value: status.value,
      reason: status.reason,
      timestamp: new Date().toISOString(),
      state: {
        isConnecting: status.value === 'connecting',
        isConnected: status.value === 'connected',
        isDisconnected: status.value === 'disconnected',
        hasError: status.value === 'error',
      }
    });
  }, [status]);

  const handleStartCall = async () => {
    try {
      console.log('Starting voice call...');
      await connect();
      console.log('Voice call connected successfully');
      
      // Create new session via API
      const response = await fetch('/api/sessions', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create session: ${error.error || response.statusText}`);
      }
      
      const newSession = await response.json();
      console.log('Session created:', newSession.id);
      addSession(newSession);
    } catch (error) {
      console.error('Failed to start call:', error);
      throw error; // Re-throw to see the full error in console
    }
  };

  return (
    <Sidebar
      defaultOpen
      collapsible="offcanvas"
      side="left"
      variant="default"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <div className="flex-none p-4">
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
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
