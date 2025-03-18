"use server";

import { db } from "@/db";
import { chatsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteChat(id: string) {
  "use server";

  await db.delete(chatsTable).where(eq(chatsTable.id, id));
}
