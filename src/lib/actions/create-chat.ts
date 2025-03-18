"use server";

import { db } from "@/db";
import { chatsTable, messagesTable, usersTable } from "@/db/schema";
import { STACKAUTHID } from "./tempuserid";
import type { TextUIPart } from "@ai-sdk/ui-utils";

export async function createChat(firstMessage?: string) {
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
      name: "Chat with Me",
      userId: STACKAUTHID,
    })
    .returning();

  if (firstMessage) {
    await db.insert(messagesTable).values({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      role: "user",
      parts: [
        {
          type: "text",
          text: firstMessage,
        } as TextUIPart,
      ],
      content: firstMessage,
      chatId: newChat[0].id,
    });
  }

  return newChat[0].id;
}
