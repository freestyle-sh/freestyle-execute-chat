"use server";
import { db } from "@/db";
import { chatsTable, messagesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Message } from "ai";
import { stackServerApp } from "@/stack";

export async function insertMessage(chatId: string, message: Message) {
  "use server";

  const user = await stackServerApp.getUser({ or: "anonymous" });
  const userId = user.id;

  const chat = await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.id, chatId));

  if (chat[0].userId !== userId) {
    throw new Error("Chat does not belong to user");
  }

  const result = await db
    .insert(messagesTable)
    .values({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      role: message.role,
      content: message.content,
      parts: message.parts,
      chatId: chatId,
    })
    .returning();

  return result;
}
