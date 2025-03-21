import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { Geist, Geist_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";

import { ChatSidebar } from "@/components/sidebar/sidebar";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Freestyle Chat",
  description: "Chat with Freestyle code execution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        ><StackProvider app={stackServerApp}><StackTheme>
          <Providers>
            <ChatSidebar />
            <main className="w-screen">{children}</main>
          </Providers>
        </StackTheme></StackProvider></body>
      </html>
    </ViewTransitions>
  );
}
