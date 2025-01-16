import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "../globals.css";
import { Nav } from "@/components/Nav";
import { cn } from "@/lib/utils";
import { ChatProvider } from "@/app/context/ChatContext";
import { VoiceProvider } from "@humeai/voice-react";
import { getHumeAccessToken } from "@/utils/getHumeAccessToken";
import { ClerkProvider } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { AppSidebar } from "@/components/app-sidebar";
import { VoiceSessionManager } from "@/components/VoiceSessionManager";
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

export const metadata: Metadata = {
  title: "MindPattern Dashboard",
  description: "Your AI emotional support companion dashboard",
};

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

  const humeConfigId = user?.publicMetadata.humeConfigId as string

  if (!humeConfigId) {
    throw new Error("No Hume config ID found. Please try logging out and back in.");
  }

  console.log('Initializing Hume Voice Provider:', {
    accessToken: accessToken ? accessToken.slice(0, 10) + '...' : 'missing',
    configId: humeConfigId,
    humeApiKey: process.env.HUME_API_KEY ? 'present' : 'missing',
    humeSecretKey: process.env.HUME_SECRET_KEY ? 'present' : 'missing',
    env: process.env.NODE_ENV,
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
          <VoiceProvider 
            auth={{ type: "accessToken", value: accessToken }} 
            configId={humeConfigId}
            sessionSettings={{
              type: "session_settings",
              languageModelApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
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
