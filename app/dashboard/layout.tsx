import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "../globals.css";
import { cn } from "@/lib/utils";
import { ChatProvider } from "@/components/chat/ChatContext";
import { VoiceProviderWrapper } from "@/components/providers/VoiceProviderWrapper";
import { getHumeAccessToken } from "@/services/hume/getHumeAccessToken";
import { ClerkProvider } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { VoiceSessionManager } from "@/components/chat/VoiceSessionManager";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { prisma } from "@/prisma/prisma";

export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: "MindPattern Dashboard",
  description: "Your AI emotional support companion dashboard",
};

async function getPrismaUserWithRetry(userId: string, retries = 3, delay = 1000): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        configId: true,
        systemPrompt: true
      }
    });
    
    if (user) return user;
    
    // If not found and we have retries left, wait before trying again
    if (i < retries - 1) {
      console.log(`User not found, retrying in ${delay}ms... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return null;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const accessToken = await getHumeAccessToken();
  console.log('🔑 VoiceProvider Init - Access Token:', accessToken ? 'Present' : 'Missing');

  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Get user's Hume config ID from Clerk metadata
  const user = await currentUser()
  if (!user) {
    throw new Error("No user found. Please try logging out and back in.");
  }
  console.log('👤 VoiceProvider Init - User:', user.id);

  // Get associated Prisma user data with retries
  const prismaUser = await getPrismaUserWithRetry(user.id);
  console.log('📋 VoiceProvider Init - Prisma User:', prismaUser ? 'Found' : 'Missing');

  if (!prismaUser) {
    // If still no user after retries, try to create one
    console.log("No Prisma user found after retries, attempting to create...");
    try {
      const response = await fetch("/api/users", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to create user");
      }
      // Try one last time to get the user
      const newPrismaUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          configId: true,
          systemPrompt: true
        }
      });
      if (!newPrismaUser) {
        throw new Error("Failed to create and retrieve user");
      }
      console.log("Successfully created new user");
      return newPrismaUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("No Prisma user found and failed to create one. Please try again.");
    }
  }

  // Destructure with default values for type safety
  const { configId, systemPrompt } = prismaUser;
  const humeConfigId = configId || user?.publicMetadata.humeConfigId as string

  if (!humeConfigId) {
    throw new Error("No Hume config ID found. Please try logging out and back in.");
  }

  console.log('🔧 VoiceProvider Init - Config:', {
    humeConfigId,
    hasSystemPrompt: !!systemPrompt,
    hasLanguageModelKey: !!process.env.OPEN_ROUTER_API_KEY
  });

  return (
    <ClerkProvider>
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          "flex flex-col min-h-screen bg-background text-foreground antialiased overflow-hidden"
        )}
      >
        <ChatProvider>
          <VoiceProviderWrapper 
            auth={{ type: "accessToken", value: accessToken }} 
            configId={humeConfigId}
            sessionSettings={{
              type: "session_settings",
              systemPrompt: systemPrompt ?? undefined,
              languageModelApiKey: process.env.OPEN_ROUTER_API_KEY
            }}
          >
            <VoiceSessionManager />
            <div className="flex h-screen flex-col">
              <div className="flex flex-1 overflow-hidden">
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                    <main className="flex-1 relative overflow-auto">
                      {children}
                    </main>
                  </SidebarInset>
                </SidebarProvider>
              </div>
            </div>
          </VoiceProviderWrapper>
        </ChatProvider>
      </body>
    </ClerkProvider>
  );
}
