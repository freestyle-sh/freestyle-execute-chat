"use client";

import { listChats } from "@/actions/chats/list-chats";
import { SidebarHistoryItem } from "./history-item";
import { SidebarSection } from "./section";
import { useQuery } from "@tanstack/react-query";
import { SidebarMenuItem, SidebarMenuSkeleton } from "../ui/sidebar";
import ClientOnly from "../client-only";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export function SidebarHistory() {
  const { data: chats = [], isLoading } = useQuery({
    queryFn: () => listChats(),
    queryKey: ["chats"],
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
        className="max-h-[calc(16*32px)] flex flex-col gap-0.5 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border hover:scrollbar-thumb-sidebar-accent"
      >
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <SidebarMenuItem key={`sidebar-history-${index.toString()}`}>
              <ClientOnly>
                <SidebarMenuSkeleton />
              </ClientOnly>
            </SidebarMenuItem>
          ))
        ) : (
          <AnimatePresence initial={false}>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <SidebarHistoryItem
                  id={chat.id}
                  title={chat.name ?? "Untitled"}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      {/* Scroll indicator */}
      <div className="absolute bottom-0 inset-x-0 flex justify-center pointer-events-none">
        <div
          className={cn(
            "h-8 w-full absolute bottom-0 opacity-70 transition-all",
            hasMoreBelow ? "bg-gradient-to-t from-sidebar" : "",
          )}
        />
        <div className="h-8 flex items-center justify-center text-muted-foreground z-10">
          <ChevronDownIcon
            className={cn(
              "h-4 w-4 transition-opacity duration-200",
              hasMoreBelow ? "opacity-70" : "opacity-0",
            )}
          />
        </div>
      </div>
    </SidebarSection>
  );
}
