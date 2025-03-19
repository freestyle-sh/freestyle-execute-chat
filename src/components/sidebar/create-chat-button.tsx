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
import { useQueryClient } from "@tanstack/react-query";

export function SidebarCreateChat() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return (
    <SidebarGroup className="z-10">
      <SidebarGroupContent>
        <SidebarMenu>
          <BaseSidebarMenuItem>
            <SidebarMenuButton
              tooltip={"Create new chat"}
              className="flex gap-2 cursor-pointer transition-all duration-200"
              onClick={() =>
                createChat().then((id) => {
                  queryClient.invalidateQueries({ queryKey: ["chats"] });
                  router.push(`/chat/${id}`);
                })
              }
            >
              <PlusIcon />
              <span className="font-medium">{"Create chat"}</span>
            </SidebarMenuButton>
          </BaseSidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
