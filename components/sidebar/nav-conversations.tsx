"use client"

import { MessageCircle } from "lucide-react"
import { useChatContext } from "@/components/chat/ChatContext"
import { cn } from "@/lib/utils"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavConversations() {
  const { sessions, selectedSession, selectSession } = useChatContext()
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Conversations</SidebarGroupLabel>
      <SidebarMenu>
        {sessions.map((session, index) => (
          <div key={session.id}>
            <SidebarMenuItem>
              <SidebarMenuButton 
                size="lg"
                className={cn(
                  "transition-all",
                  selectedSession === session.id && "border border-border bg-sidebar-accent"
                )}
                isActive={selectedSession === session.id}
                onClick={() => selectSession(session.id)}
              >
                <MessageCircle className="h-4 w-4" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {new Date(session.timestamp).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.messages.length} messages
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
