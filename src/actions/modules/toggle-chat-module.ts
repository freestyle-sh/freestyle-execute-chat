"use server";

import { db } from "@/db";
import { chatModulesEnabledTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type ChatModuleStatus = {
  chatId: string;
  moduleId: string;
  enabled: boolean;
};

export async function getChatModules(
  chatId: string,
): Promise<ChatModuleStatus[]> {
  try {
    const enabledModules = await db
      .select()
      .from(chatModulesEnabledTable)
      .where(eq(chatModulesEnabledTable.chatId, chatId));

    return enabledModules.map((module) => ({
      chatId: module.chatId,
      moduleId: module.moduleId,
      enabled: module.enabled,
    }));
  } catch (error) {
    console.error("Error fetching chat modules:", error);
    throw new Error("Failed to fetch chat modules");
  }
}

export async function toggleChatModule({
  chatId,
  moduleId,
  enabled,
}: {
  chatId: string;
  moduleId: string;
  enabled: boolean;
}): Promise<ChatModuleStatus> {
  try {
    // Check if there's an existing entry
    const existingEntry = await db
      .select()
      .from(chatModulesEnabledTable)
      .where(
        and(
          eq(chatModulesEnabledTable.chatId, chatId),
          eq(chatModulesEnabledTable.moduleId, moduleId),
        ),
      )
      .then((rows) => rows[0]);

    if (existingEntry) {
      // Update existing entry
      await db
        .update(chatModulesEnabledTable)
        .set({ enabled })
        .where(
          and(
            eq(chatModulesEnabledTable.chatId, chatId),
            eq(chatModulesEnabledTable.moduleId, moduleId),
          ),
        );
    } else {
      // Insert new entry
      await db.insert(chatModulesEnabledTable).values({
        chatId,
        moduleId,
        enabled,
      });
    }

    return {
      chatId,
      moduleId,
      enabled,
    };
  } catch (error) {
    console.error("Error toggling chat module:", error);
    throw new Error("Failed to toggle chat module");
  }
}
