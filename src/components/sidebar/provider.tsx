"use client";

import type { ReactNode } from "react";
import { SidebarProvider as BaseSidebarProvider } from "@/components/ui/sidebar";
import { useSidebarStore } from "@/lib/stores/sidebar";
import ClientOnly from "../client-only";

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const { isOpen, setOpen } = useSidebarStore();

  return (
    <ClientOnly>
      <BaseSidebarProvider
        defaultOpen={isOpen}
        open={isOpen}
        onOpenChange={setOpen}
      >
        {children}
      </BaseSidebarProvider>
    </ClientOnly>
  );
}
