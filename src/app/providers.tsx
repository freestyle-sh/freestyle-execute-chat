"use client";

import { SidebarProvider } from "@/components/sidebar/provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { DialogProvider } from "@/components/utility/dialogs";

export const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider attribute={"class"}>
        <SidebarProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster richColors position="top-right" />
            <DialogProvider />
            {children}
          </QueryClientProvider>
        </SidebarProvider>
      </ThemeProvider>
    </>
  );
}
