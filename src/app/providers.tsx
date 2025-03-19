"use client";

import { SidebarProvider } from "@/components/sidebar/provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

export const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider attribute={"class"}>
        <SidebarProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster richColors position="top-right" />
            {children}
          </QueryClientProvider>
        </SidebarProvider>
      </ThemeProvider>
    </>
  );
}
