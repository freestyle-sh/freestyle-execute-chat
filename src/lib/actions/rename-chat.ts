"use server";

import { db } from "@/db";
import { chatsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function renameChat(id: string, newName: string) {
  "use server";

  await db
    .update(chatsTable)
    .set({ name: newName })
    .where(eq(chatsTable.id, id));
}

