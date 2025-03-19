"use client";

import {
  MessageSquareIcon,
  MoreHorizontalIcon,
  TrashIcon,
  PenIcon,
  CheckIcon,
  XIcon,
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
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { deleteChat } from "@/lib/actions/delete-chat";
import { renameChat } from "@/lib/actions/rename-chat";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

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
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(title);

  const [href, isActive] = useMemo(() => {
    const href = `/chat/${id}`;
    return [href, pathname === href];
  }, [id, pathname]);

  const handleRename = async () => {
    if (newName.trim() === "") {
      return;
    }

    toast.promise(
      renameChat(id, newName).then(() =>
        queryClient.invalidateQueries({ queryKey: ["chats:list"] }),
      ),
      {
        loading: "Renaming...",
        success: "Chat renamed",
        error: "Error renaming chat",
      },
    );

    setIsRenaming(false);
  };

  const cancelRename = () => {
    setNewName(title);
    setIsRenaming(false);
  };

  if (isRenaming && sidebar.open) {
    return (
      <BaseSidebarMenuItem
        className={cn("group/menu-item relative", className)}
      >
        <div
          className={cn(
            "flex gap-1 items-center justify-between w-full h-8 px-1 rounded-md",
            // "!bg-sidebar-accent",
          )}
        >
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={cn(
              "h-7 text-sm !bg-sidebar-accent border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-1",
              isActive ? "font-medium" : "",
            )}
            placeholder="Enter chat name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRename();
              } else if (e.key === "Escape") {
                cancelRename();
              }
            }}
          />
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleRename}
              className={cn(
                "flex cursor-pointer items-center justify-center h-6 w-6 rounded-sm text-muted-foreground",
                "hover:bg-sidebar-accent",
              )}
            >
              <CheckIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={cancelRename}
              className={cn(
                "flex cursor-pointer items-center justify-center h-6 w-6 rounded-sm !text-muted-foreground",
                "hover:bg-sidebar-accent",
              )}
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </BaseSidebarMenuItem>
    );
  }

  return (
    <BaseSidebarMenuItem
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("relative", className)}
    >
      <SidebarMenuButton
        tooltip={title}
        isActive={isActive}
        asChild
        className="transition-all duration-150"
      >
        <Link
          className="flex flex-row justify-between items-center"
          href={href}
        >
          <span className="flex items-center gap-2">
            {sidebar.open ? (
              <span className={cn(isActive ? "font-medium" : "")}>{title}</span>
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
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
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
