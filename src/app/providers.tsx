"use client";

import { SidebarProvider } from "@/components/sidebar/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

export const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider attribute={"class"}>
        <SidebarProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </SidebarProvider>
      </ThemeProvider>
    </>
  );
}
