import { PlusIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { SidebarMenuLinkItem } from "./menu-item";
import { SidebarHeader } from "./header";
import { SidebarToggleButton } from "./toggle-button";
import Logo from "../logo";
import { SidebarHistory } from "./history";
import { SidebarSection } from "./section";
import { createChat } from "@/lib/actions/create-chat";
import { redirect } from "next/navigation";
import { SidebarCreateChat } from "./create-chat-button";

export function ChatSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href={"/"}>
          <Logo className="stroke-primary" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <SidebarCreateChat />
        <SidebarHistory />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuLinkItem
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
