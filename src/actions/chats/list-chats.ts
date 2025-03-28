"use server";
import { db } from "@/db";
import { chatsTable, messagesTable } from "@/db/schema";
import { eq, desc, sql, max } from "drizzle-orm";
import { stackServerApp } from "@/stack";
import { auth } from "../auth";

export async function listChats() {
  "use server";

  const user = await auth({ or: "anonymous" });
  if (!user) {
    throw new Error("User not found");
  }
  const userId = user.id;

  // Get all chats with their latest message timestamp
  const chatsWithLastMessage = await db
    .select({
      chat: chatsTable,
      lastMessageTime: max(messagesTable.createdAt).as("last_message_time"),
    })
    .from(chatsTable)
    .leftJoin(messagesTable, eq(chatsTable.id, messagesTable.chatId))
    .where(eq(chatsTable.userId, userId))
    .groupBy(chatsTable.id)
    .orderBy(desc(sql<string>`last_message_time`));

  // Return just the chat objects
  return chatsWithLastMessage.map((result) => result.chat);
}
