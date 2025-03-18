"use server";

import { SidebarHistoryItem } from "./history-item";
import { SidebarSection } from "./section";

export async function SidebarHistory() {
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
      <SidebarHistoryItem
        id="1"
        title="Chat 1"
      />
      <SidebarHistoryItem
        id="2"
        title="Chat 2"
      />
    </SidebarSection>
  );
}
