"use server";
import { db } from "@/db";
import { chatsTable, messagesTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type { Message } from "ai";
import { stackServerApp } from "@/stack";
import { z } from "zod";

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

  const lastMessage = await z
    .string()
    .uuid()
    .safeParseAsync(message.id)
    .then(async (res) => {
      if (res.success) {
        return await db
          .select()
          .from(messagesTable)
          .where(eq(messagesTable.id, message.id))
          .limit(1)
          .then((result) => result.at(0));
      }

      return undefined;
    });

  if (lastMessage !== undefined) {
    return await db
      .update(messagesTable)
      .set({
        content: message.content,
        parts: message.parts,
      })
      .where(eq(messagesTable.id, message.id))
      .returning()
      .then((result) => result[0]);
  }

  return await db
    .insert(messagesTable)
    .values({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      role: message.role,
      content: message.content,
      parts: message.parts,
      chatId: chatId,
    })
    .returning()
    .then((result) => result[0]);
}
