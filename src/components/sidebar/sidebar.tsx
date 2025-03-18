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
  SidebarMenu,
} from "@/components/ui/sidebar";
import { SidebarSection } from "./section";
import { SidebarMenuItem } from "./menu-item";
import { SidebarHeader } from "./header";
import { SidebarToggleButton } from "./toggle-button";

export function ChatSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href={"/"}>
          <MessageCircleIcon size={24} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSection label="History">
          <SidebarMenuItem
            href="/chat/1"
            icon={MessageSquareIcon}
            label="Chat 1"
            isActive={pathname === "/chat/1"}
          />
          <SidebarMenuItem
            href="/chat/2"
            icon={MessageSquareIcon}
            label="Chat 2"
            isActive={pathname === "/chat/2"}
          />
        </SidebarSection>
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

