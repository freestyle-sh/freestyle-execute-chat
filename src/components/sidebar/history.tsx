"use server";

import { listChats } from "@/lib/actions/list-chats";
import { SidebarHistoryItem } from "./history-item";
import { SidebarSection } from "./section";

export async function SidebarHistory() {
  const chats = await listChats();

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
