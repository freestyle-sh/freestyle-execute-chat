"use server";

import { listChats } from "@/lib/actions/list-chats";
import { SidebarHistoryItem } from "./history-item";
import { SidebarSection } from "./section";

export async function SidebarHistory() {
  const chats = await listChats();

  return (
    <SidebarSection label="History">
      {chats.map((chat) => (
        <SidebarHistoryItem
          key={chat.id}
          id={chat.id}
          title={chat.name ?? chat.id}
        />
      ))}
    </SidebarSection>
  );
}
