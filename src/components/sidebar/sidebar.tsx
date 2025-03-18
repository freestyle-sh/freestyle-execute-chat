"use client";

import {
  SettingsIcon,
  MessageSquareIcon,
  MessageCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSidebarStore } from "@/lib/stores/sidebar";
import { cn } from "@/lib/utils";

export function ChatSidebar() {
  const sidebar = useSidebarStore();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div
          className={cn(
            "flex items-center ml-1 py-0.5",
            sidebar.isOpen ? "justify-between" : "justify-start",
          )}
        >
          <h2 className="text-lg font-semibold overflow-hidden">
            <Link href={"/"}>
              <MessageCircleIcon size={24} />
            </Link>
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>History</SidebarGroupLabel>
          <SidebarGroupContent>
            {/* Chat History */}
            <SidebarMenu>
              {/* Recent Chat History (Example) */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Chat 1"
                  isActive={pathname === "/chat/1"}
                  asChild
                >
                  <Link href="/chat/1">
                    <MessageSquareIcon />
                    <span>Chat 1</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Chat 2"
                  isActive={pathname === "/chat/2"}
                  asChild
                >
                  <Link href="/chat/2">
                    <MessageSquareIcon />
                    <span>Chat 2</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" asChild>
              <Link href="/settings">
                <SettingsIcon className="mr-2" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="w-min">
            <SidebarMenuButton asChild>
              <SidebarTrigger className="cursor-pointer" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
