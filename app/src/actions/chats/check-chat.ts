"use server";
import { db } from "@/db";
import { type Chat, chatsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getChatInfo(id: string): Promise<Chat | undefined> {
  "use server";

  return await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.id, id))
    .limit(1)
    .then((result) => (result.length > 0 ? result[0] : undefined));
}
