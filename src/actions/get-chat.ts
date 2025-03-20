"use server";
import { db } from "@/db";
import { messagesTable, type Message } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getChat(id: string): Promise<Message[]> {
  "use server";

  return (await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, id))
    .orderBy(asc(messagesTable.createdAt))) as Message[];
}
