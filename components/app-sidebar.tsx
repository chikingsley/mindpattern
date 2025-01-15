"use client"

import * as React from "react"
import { GalleryVerticalEnd } from "lucide-react"
import { useVoice } from "@humeai/voice-react"
import { useChatContext } from "@/app/context/ChatContext"
import { Button } from "@/components/ui/button"
import { NavConversations } from "@/components/nav-conversations"
import { NavUser } from "@/components/nav-user"
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
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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

  const handleStartCall = async () => {
    try {
      await connect();
      // Create new session
      const newSession = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        messages: []
      };
      addSession(newSession);
    } catch (error) {
      console.error('Failed to start call:', error);
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
            Start New Chat
          </Button>
        </div>
        <NavConversations />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
