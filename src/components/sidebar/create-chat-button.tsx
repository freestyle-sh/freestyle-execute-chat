"use client";
import { PlusIcon } from "lucide-react";
import {
  SidebarMenuItem as BaseSidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { createChat } from "@/lib/actions/create-chat";
import { useRouter } from "next/navigation";

export function SidebarCreateChat() {
  const router = useRouter();

  return (
    <SidebarGroup className="z-10">
      <SidebarGroupContent>
        <SidebarMenu>
          <BaseSidebarMenuItem>
            <SidebarMenuButton
              tooltip={"Create new chat"}
              className="flex gap-2 cursor-pointer"
              onClick={() =>
                createChat().then((id) => router.push(`/chat/${id}`))
              }
            >
              <PlusIcon />
              <span>{"Create chat"}</span>
            </SidebarMenuButton>
          </BaseSidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
