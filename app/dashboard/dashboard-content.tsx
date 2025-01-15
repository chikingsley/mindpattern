"use client";

import { VoiceProvider } from "@humeai/voice-react";
import { getHumeAccessToken } from "@/utils/getHumeAccessToken";
import { auth } from '@clerk/nextjs';
import { AppSidebar } from "@/components/app-sidebar";
import { prisma } from '@/lib/prisma';
import { Nav } from "@/components/Nav";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

interface DashboardContentProps {
  children: React.ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeVoice() {
      try {
        // Get access token
        const token = await getHumeAccessToken();
        if (!token) {
          throw new Error("No access token available");
        }
        setAccessToken(token);

        // Get user ID and config
        const { userId } = await auth();
        if (!userId) {
          throw new Error("No user found");
        }

        // Get user's Hume config ID from database
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user config");
        }
        const user = await response.json();
        setConfigId(user.configId);

        console.log('Initialized Hume Voice Provider:', {
          accessToken: token ? token.slice(0, 10) + '...' : 'missing',
          configId: user.configId ? user.configId : 'not found in database',
          userId,
          env: process.env.NODE_ENV,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize voice';
        console.error('Voice initialization error:', message);
        setError(message);
      }
    }

    initializeVoice();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!accessToken || !configId) {
    return <div>Loading...</div>;
  }

  return (
    <VoiceProvider auth={{ type: "accessToken", value: accessToken }} configId={configId}>
      <div className="flex h-screen flex-col">
        <Nav />
        <div className="flex flex-1 overflow-hidden">
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
                <div className="flex items-center gap-1 px-2">
                  <SidebarTrigger className="-ml-0.5" />
                  <Separator orientation="vertical" className="h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#">
                          Building Your Application
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>
              <main className="flex-1 relative overflow-auto">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </VoiceProvider>
  );
}
