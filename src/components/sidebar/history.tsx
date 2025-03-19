"use client";

import { listChats } from "@/lib/actions/list-chats";
import { SidebarHistoryItem } from "./history-item";
import { SidebarSection } from "./section";
import { useQuery } from "@tanstack/react-query";
import { SidebarMenuItem, SidebarMenuSkeleton } from "../ui/sidebar";
import ClientOnly from "../client-only";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

export function SidebarHistory() {
  const { data: chats = [], isLoading } = useQuery({
    queryFn: () => listChats(),
    queryKey: ["chats:list"],
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  // Check if there are more items to scroll to
  const checkScrollability = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollHeight, scrollTop, clientHeight } = container;
      setHasMoreBelow(scrollHeight > scrollTop + clientHeight);
    }
  }, []);

  // Initialize and update on chats data change
  useEffect(() => {
    if (chats.length > 0) {
      checkScrollability();
    }
  }, [chats, checkScrollability]);

  return (
    <SidebarSection label="History" className="flex flex-col relative">
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="max-h-[calc(5*32px)] flex flex-col gap-0.5 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border hover:scrollbar-thumb-sidebar-accent"
      >
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
      {/* Scroll indicator */}
      {hasMoreBelow && (
        <div className="absolute bottom-0 inset-x-0 flex justify-center pointer-events-none">
          <div className="bg-gradient-to-t from-sidebar h-8 w-full absolute bottom-0 opacity-70" />
          <div className="h-8 flex items-center justify-center text-muted-foreground z-10">
            <ChevronDownIcon className="h-4 w-4 opacity-70" />
          </div>
        </div>
      )}
    </SidebarSection>
  );
}
