"use server";
import { db } from "@/db";
import { chatsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function chatExists(id: string): Promise<boolean> {
  "use server";

  return await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.id, id))
    .limit(1)
    .then((result) => result.length > 0);
}
