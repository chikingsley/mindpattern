"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react"
import { useLayoutEffect, useState } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { MouseEvent } from "react"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, isLoaded } = useUser()
  const [isDarkMode, setIsDarkMode] = useState(false)

  useLayoutEffect(() => {
    const el = document.documentElement
    setIsDarkMode(el.classList.contains("dark"))
  }, [])

  const toggleDark = (e: MouseEvent<HTMLDivElement>) => {
    // Prevent the dropdown from closing
    e.preventDefault()
    const el = document.documentElement
    el.classList.toggle("dark")
    setIsDarkMode((prev) => !prev)
  }

  if (!isLoaded) {
    return null
  }

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SignInButton mode="modal">
            <Button variant="default" className="w-full">
              Sign In
            </Button>
          </SignInButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const userInitials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.firstName?.[0] ?? 'U'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.imageUrl} alt={user.fullName ?? ''} />
                <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.fullName}</span>
                <span className="truncate text-xs">{user.primaryEmailAddress?.emailAddress}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.imageUrl} alt={user.fullName ?? ''} />
                  <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.fullName}</span>
                  <span className="truncate text-xs">{user.primaryEmailAddress?.emailAddress}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles className="mr-2" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="mr-2" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={toggleDark}>
                {isDarkMode ? (
                  <>
                    <Sun className="mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="mr-2" />
                    Dark Mode
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <SignOutButton>
              <DropdownMenuItem>
                <LogOut className="mr-2" />
                Sign Out
              </DropdownMenuItem>
            </SignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
