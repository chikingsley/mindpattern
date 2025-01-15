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
import { AppSidebar } from "@/components/app-sidebar";
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

  const configId = process.env.HUME_CONFIG_ID;

  console.log('Initializing Hume Voice Provider:', {
    accessToken: accessToken ? 'present' : 'missing',
    configId: configId ? 'present (optional)' : 'not provided (optional)',
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
        </ChatProvider>
      </body>
    </ClerkProvider>
  );
}
