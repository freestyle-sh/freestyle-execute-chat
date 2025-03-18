"use client";

import {
  MessageSquareIcon,
  MoreHorizontalIcon,
  TrashIcon,
  PenIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarMenuButton,
  SidebarMenuItem as BaseSidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { deleteChat } from "@/lib/actions/delete-chat";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function SidebarHistoryItem({
  id,
  title,
  className,
}: {
  id: string;
  title: string;
  className?: string;
}) {
  const sidebar = useSidebar();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [hovered, setHovered] = useState(false);

  const href = `/chat/${id}`;

  return (
    <BaseSidebarMenuItem
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("relative", className)}
    >
      <SidebarMenuButton
        tooltip={title}
        isActive={pathname === href}
        asChild
        className="transition-all duration-150"
      >
        <Link
          className="flex flex-row justify-between items-center"
          href={href}
        >
          <span className="flex items-center gap-2">
            {sidebar.open ? (
              <span className={cn(pathname === href ? "font-medium" : "")}>
                {title}
              </span>
            ) : (
              <MessageSquareIcon className={cn("h-4 w-4")} />
            )}
          </span>
        </Link>
      </SidebarMenuButton>

      <div
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity z-10",
          hovered ? "opacity-100" : "opacity-0",
          sidebar.open ? "" : "hidden",
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={
                "h-6 w-6 rounded-sm flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent cursor-pointer"
              }
              type="button"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontalIcon className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <PenIcon className="mr-2 h-4 w-4" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                toast.promise(
                  deleteChat(id).then(() =>
                    queryClient.invalidateQueries({ queryKey: ["chats:list"] }),
                  ),
                  {
                    loading: "Deleting...",
                    success: "Deleted chat",
                    error: "Error deleting chat",
                  },
                );
              }}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </BaseSidebarMenuItem>
  );
}
