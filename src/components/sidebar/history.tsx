"use server";

import { listChats } from "@/lib/actions/list-chats";
import { SidebarHistoryItem } from "./history-item";
import { SidebarSection } from "./section";

export async function SidebarHistory() {
  const chats = await listChats();

  return (
    <SidebarSection label="History" className="flex flex-col">
      <div className="max-h-[calc(5*32px)] overflow-y-auto pr-1 
        scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border hover:scrollbar-thumb-sidebar-accent">
        {chats.map((chat) => (
          <SidebarHistoryItem
            key={chat.id}
            id={chat.id}
            title={chat.name ?? chat.id}
          />
        ))}
      </div>
    </SidebarSection>
  );
}
