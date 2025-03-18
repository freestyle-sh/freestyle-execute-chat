"use server";

const STACKAUTHID = "57278389-2e23-4c18-86f8-aaa0667417c4";

import { db } from "@/db";
import { chatsTable, messagesTable, usersTable } from "@/db/schema";

export async function createChat(firstMessage: string) {
  "use server";

  await db
    .insert(usersTable)
    .values({
      stackId: "STACKAUTH",
      id: STACKAUTHID,
    })
    .onConflictDoNothing();

  const newChat = await db
    .insert(chatsTable)
    .values({
      createdAt: new Date(),
      id: crypto.randomUUID(),
      userId: STACKAUTHID,
    })
    .returning();

  await db.insert(messagesTable).values({
    id: crypto.randomUUID(),
    createdAt: new Date(),
    role: "user",
    content: firstMessage,
    chatId: newChat[0].id,
  });

  return newChat[0].id;
}
