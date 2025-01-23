import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "../globals.css";
import { Nav } from "@/components/Nav";
import { cn } from "@/lib/utils";
import { ChatProvider } from "@/app/context/ChatContext";
import { VoiceProvider } from "@humeai/voice-react";
import { getHumeAccessToken } from "@/services/hume/getHumeAccessToken";
import { ClerkProvider } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { AppSidebar } from "@/components/app-sidebar";
import { VoiceSessionManager } from "@/components/VoiceSessionManager";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
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

  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Get user's Hume config ID from Clerk metadata
  const user = await currentUser()
  if (!user) {
    throw new Error("No user found. Please try logging out and back in.");
  }

  // Get associated Prisma user data with retries
  const prismaUser = await getPrismaUserWithRetry(user.id);

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

  // console.log('Initializing Hume Voice Provider:', {
  //   accessToken: accessToken ? accessToken.slice(0, 10) + '...' : 'missing',
  //   configId: humeConfigId,
  //   humeApiKey: process.env.HUME_API_KEY ? 'present' : 'missing',
  //   humeSecretKey: process.env.HUME_SECRET_KEY ? 'present' : 'missing',
  //   env: process.env.NODE_ENV,
  // });

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
          <VoiceProvider 
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
        </ChatProvider>
      </body>
    </ClerkProvider>
  );
}
