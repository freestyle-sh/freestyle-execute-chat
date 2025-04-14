"use client";

import { SettingsIcon, GithubIcon, LogInIcon, GlobeLock } from "lucide-react";
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
import { useSidebarStore, useSidebarInit } from "@/stores/sidebar";
import { UserButton, useUser } from "@stackframe/stack";

export function ChatSidebar() {
  const { openMobile, setOpenMobile } = useSidebarStore();
  const user = useUser();
  useSidebarInit();

  return (
    <Sidebar
      collapsible="icon"
      className="transition-all duration-300"
      openMobile={openMobile}
      onOpenChangeMobile={setOpenMobile}
    >
      <SidebarHeader className="border-b border-sidebar-border pb-2 h-12">
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
            href="/privacy"
            label="Privacy"
            target="_blank"
            icon={GlobeLock}
          />
          <SidebarMenuLinkItem
            href="https://github.com/freestyle-sh/freestyle-execute-chat"
            label="Github"
            target="_blank"
            icon={GithubIcon}
          />
          {user ? (
            <>
              <SidebarMenuLinkItem
                href="/settings"
                icon={SettingsIcon}
                label="Settings"
              />
              <SidebarMenuLinkItem
                href="/handler/signout"
                icon={LogInIcon}
                label="Logout"
              />
            </>
          ) : (
            <SidebarMenuLinkItem
              href="/handler/signin"
              icon={LogInIcon}
              label="Login"
            />
          )}

          <SidebarToggleButton />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
