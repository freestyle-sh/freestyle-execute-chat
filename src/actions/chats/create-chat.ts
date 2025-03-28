"use server";

import { db } from "@/db";
import {
  chatsTable,
  messagesTable,
  usersTable,
  chatModulesEnabledTable,
} from "@/db/schema";
import type { TextUIPart } from "@ai-sdk/ui-utils";
import { claudeSonnetModel } from "@/lib/model";
import { generateText } from "ai";
import { renameChat } from "./rename-chat";
import { asc, eq } from "drizzle-orm";

import type { ModuleState } from "@/stores/modules";
import { stackServerApp } from "@/stack";
import { auth } from "../auth";

export async function generateChatTitle(message: string, chatId: string) {
  try {
    const response = await generateText({
      model: claudeSonnetModel,
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

export async function createChat(
  firstMessage?: string,
  selectedModules?: Record<string, ModuleState>,
) {
  "use server";

  const user = await auth({ or: "anonymous" });
  if (user === null) {
    throw new Error("User not found");
  }
  const userId = user.id;

  await db
    .insert(usersTable)
    .values({
      stackId: userId,
      id: userId,
    })
    .onConflictDoNothing();

  const newChat = await db
    .insert(chatsTable)
    .values({
      createdAt: new Date(),
      id: crypto.randomUUID(),
      userId: userId,
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

  // Apply selected modules to the new chat if provided
  if (selectedModules) {
    const moduleValues = Object.entries(selectedModules).map(
      ([moduleId, { enabled }]) => ({
        chatId,
        moduleId,
        enabled,
      }),
    );

    await db
      .insert(chatModulesEnabledTable)
      .values(moduleValues)
      .onConflictDoUpdate({
        target: [
          chatModulesEnabledTable.chatId,
          chatModulesEnabledTable.moduleId,
        ],
        set: {
          enabled: true,
        },
      });
  }

  return chatId;
}
