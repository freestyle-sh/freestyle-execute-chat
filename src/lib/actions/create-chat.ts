"use server";

import { db } from "@/db";
import { chatsTable, messagesTable, usersTable } from "@/db/schema";
import { STACKAUTHID } from "./tempuserid";
import type { TextUIPart } from "@ai-sdk/ui-utils";
import { smallModel } from "@/lib/model";
import { generateText, type Message } from "ai";
import { renameChat } from "./rename-chat";
import { asc, desc, eq } from "drizzle-orm";

export async function generateChatTitle(message: string, chatId: string) {
  try {
    const response = await generateText({
      model: smallModel,
      messages: [
        {
          role: "user",
          content: `Generate a short, concise title (4-5 words max) for a chat that starts with this message: "${message}". Just respond with the title, no quotes or explanation.`,
        },
      ],
      maxTokens: 20,
    });

    // Clean up any quotes or extra spaces
    const title = response.text.trim().replace(/["']/g, "");

    if (title) {
      await renameChat(chatId, title);
    } else {
      console.error("Generated title is empty or invalid.");
    }
  } catch (error) {
    console.error("Failed to generate chat title:", error);
  }
}

export async function maybeUpdateChatTitle(chatId: string): Promise<boolean> {
  try {
    const chat = await db
      .select()
      .from(chatsTable)
      .where(eq(chatsTable.id, chatId))
      .limit(1)
      .then((result) => result[0]);

    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, chatId))
      .orderBy(asc(messagesTable.createdAt));

    if (chat.name === null) {
      await generateChatTitle(messages[0].content, chatId);
      return true;
    }
  } catch (error) {
    console.error("Failed to update chat title:", error);
  }
  return false;
}

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
      userId: STACKAUTHID,
    })
    .returning();

  const chatId = newChat[0].id;

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
      chatId: chatId,
    });

    // Trigger title generation asynchronously
    // This runs in the background and doesn't block the chat creation
    generateChatTitle(firstMessage, chatId).catch((err) => {
      console.error("Background title generation failed:", err);
    });
  }

  return chatId;
}
