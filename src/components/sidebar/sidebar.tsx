"use client";

import {
  SettingsIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  TrashIcon,
  PenIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem as BaseSidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SidebarSection } from "./section";
import { SidebarMenuItem } from "./menu-item";
import { SidebarHeader } from "./header";
import { SidebarToggleButton } from "./toggle-button";
import Logo from "../logo";
import { useState } from "react";
import { cn } from "@/lib/utils";

function SidebarHistoryItem({
  id,
  title,
  className,
  onDelete,
  onRename,
}: {
  id: string;
  title: string;
  className?: string;
  onDelete?: () => void;
  onRename?: () => void;
}) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);

  const href = `/chat/${id}`;

  return (
    <BaseSidebarMenuItem
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("group relative", className)}
    >
      <SidebarMenuButton tooltip={title} isActive={pathname === href} asChild>
        <Link
          className="flex flex-row justify-between items-center"
          href={href}
        >
          <span className="flex items-center gap-2">
            <MessageSquareIcon className="w-4 h-4" />
            <span>{title}</span>
          </span>
        </Link>
      </SidebarMenuButton>

      <div
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity",
          hovered ? "opacity-100" : "opacity-0",
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
            {onRename && (
              <DropdownMenuItem onClick={onRename}>
                <PenIcon className="mr-2 h-4 w-4" />
                <span>Rename</span>
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <TrashIcon className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </BaseSidebarMenuItem>
  );
}

function SidebarHistory() {
  const handleDelete = (id: string) => {
    console.log(`Delete chat ${id}`);
    // Implement actual delete logic here
  };

  const handleRename = (id: string) => {
    console.log(`Rename chat ${id}`);
    // Implement actual rename logic here
  };

  return (
    <SidebarSection label="History">
      <SidebarHistoryItem
        id="1"
        title="Chat 1"
        onDelete={() => handleDelete("1")}
        onRename={() => handleRename("1")}
      />
      <SidebarHistoryItem
        id="2"
        title="Chat 2"
        onDelete={() => handleDelete("2")}
        onRename={() => handleRename("2")}
      />
    </SidebarSection>
  );
}

export function ChatSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href={"/"}>
          <Logo className="stroke-primary" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem
            href="/settings"
            icon={SettingsIcon}
            label="Settings"
          />
          <SidebarToggleButton />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
