import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "MindPattern - Your AI Emotional Support Companion",
  description: "MindPattern helps you identify behavior patterns and take meaningful steps forward",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <ClerkProvider>
        <body
          className={cn(
            GeistSans.variable,
            GeistMono.variable,
            "flex flex-col min-h-screen bg-background text-foreground antialiased"
          )}
        >
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
