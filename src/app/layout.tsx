import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { SidebarProvider } from "@/components/sidebar/provider";
import { ChatSidebar } from "@/components/sidebar/sidebar";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute={"class"}>
          <SidebarProvider>
            <ChatSidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
