"use client";

import { listChats } from "@/lib/actions/list-chats";
import { SidebarHistoryItem } from "./history-item";
import { SidebarSection } from "./section";
import { useQuery } from "@tanstack/react-query";
import { SidebarMenuItem, SidebarMenuSkeleton } from "../ui/sidebar";
import ClientOnly from "../client-only";

export function SidebarHistory() {
  const { data: chats = [], isLoading } = useQuery({
    queryFn: () => listChats(),
    queryKey: ["chats:list"],
  });

  return (
    <SidebarSection label="History" className="flex flex-col">
      <div className="max-h-[calc(5*32px)] flex flex-col gap-0.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border hover:scrollbar-thumb-sidebar-accent">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <SidebarMenuItem key={`sidebar-history-${index.toString()}`}>
                <ClientOnly>
                  <SidebarMenuSkeleton />
                </ClientOnly>
              </SidebarMenuItem>
            ))
          : chats.map((chat) => (
              <SidebarHistoryItem
                key={chat.id}
                id={chat.id}
                title={chat.name ?? chat.id}
              />
            ))}
      </div>
    </SidebarSection>
  );
}
