import { SettingsIcon } from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { SidebarMenuLinkItem } from "./menu-item";
import { SidebarHeader } from "./header";
import { SidebarToggleButton } from "./toggle-button";
import Logo from "../logo";
import { SidebarHistory } from "./history";
import { SidebarCreateChat } from "./create-chat-button";

export function ChatSidebar() {
  return (
    <Sidebar collapsible="icon" className="transition-all duration-300">
      <SidebarHeader className="border-b border-sidebar-border pb-2">
        <Link href={"/"}>
          <Logo className="stroke-primary" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-2 mt-2">
        <SidebarCreateChat />
        <SidebarHistory />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border pt-2">
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
