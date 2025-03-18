import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ViewTransitions } from "next-view-transitions";

import { ChatSidebar } from "@/components/sidebar/sidebar";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
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
        >
          <Providers>
            <Toaster richColors position="top-right" />
            <ChatSidebar />
            <main className="w-screen">{children}</main>
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
