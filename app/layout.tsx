import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Nav } from "../components/Nav";
import { cn } from "../lib/utils";
import { ChatProvider } from "./context/ChatContext";
import Sidebar from "../components/Sidebar";
import { VoiceProvider } from "@humeai/voice-react";
import { getHumeAccessToken } from "../utils/getHumeAccessToken";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "Hume AI - EVI - Next.js Starter",
  description: "A Next.js starter using Hume AI's Empathic Voice Interface",
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

  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;

  return (
    <html lang="en" className="h-full">
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
              configId={configId}
            >
              <div className="flex h-screen flex-col">
                <Nav />
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 relative">
                    {children}
                  </main>
                </div>
              </div>
            </VoiceProvider>
          </ChatProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
