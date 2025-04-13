"use server";

import { db } from "@/db";
import {
  freestyleModulesTable,
  chatModulesEnabledTable,
  moduleRequestsTable,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { stackServerApp } from "@/stack";

export type ModuleRequestResponse = {
  id: string;
  chatId: string;
  moduleId: string;
  reason: string;
  state: "pending" | "approved" | "denied";
  configValues?: Record<string, string>;
  createdAt: Date;
};

export async function getOrCreateModuleRequest({
  chatId,
  moduleId,
  toolCallId,
  reason,
  configValues,
}: {
  chatId: string;
  moduleId: string;
  toolCallId: string;
  reason: string;
  configValues?: Record<string, string>;
}): Promise<ModuleRequestResponse> {
  try {
    // Check if a request already exists for this tool call ID
    // We only need to check by toolCallId since it's globally unique 
    // and guarantees deduplication across sessions
    const existingRequest = await db
      .select()
      .from(moduleRequestsTable)
      .where(eq(moduleRequestsTable.toolCallId, toolCallId))
      .then((rows) => rows[0]);

    if (existingRequest) {
      return {
        id: existingRequest.id,
        chatId: existingRequest.chatId,
        moduleId: existingRequest.moduleId,
        reason: existingRequest.reason,
        state: existingRequest.state as "pending" | "approved" | "denied",
        configValues: existingRequest.configValues as
          | Record<string, string>
          | undefined,
        createdAt: existingRequest.createdAt,
      };
    }

    // Check if the module exists
    const module = await db
      .select()
      .from(freestyleModulesTable)
      .where(eq(freestyleModulesTable.id, moduleId))
      .then((rows) => rows[0]);

    if (!module) {
      throw new Error(`Module with ID ${moduleId} not found`);
    }

    // Check if the module is already enabled for this chat
    const existingEnabled = await db
      .select()
      .from(chatModulesEnabledTable)
      .where(
        and(
          eq(chatModulesEnabledTable.chatId, chatId),
          eq(chatModulesEnabledTable.moduleId, moduleId),
        ),
      )
      .then((rows) => rows[0]);

    // If the module is already enabled, create a pre-approved request
    let initialState: "pending" | "approved" = "pending";
    if (existingEnabled?.enabled) {
      initialState = "approved";
    }

    // Create a new module request
    const newRequest = await db
      .insert(moduleRequestsTable)
      .values({
        chatId,
        moduleId,
        toolCallId,
        reason,
        state: initialState,
        configValues: configValues || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return {
      id: newRequest[0].id,
      chatId,
      moduleId,
      reason,
      state: initialState,
      configValues,
      createdAt: newRequest[0].createdAt,
    };
  } catch (error) {
    console.error("Error creating module request:", error);
    throw new Error(`Failed to create module request: ${error}`);
  }
}

export async function getModuleRequest(toolCallId: string) {
  try {
    const request = await db
      .select()
      .from(moduleRequestsTable)
      .where(eq(moduleRequestsTable.toolCallId, toolCallId))
      .then((rows) => rows[0]);

    if (!request) {
      return null;
    }

    return {
      id: request.id,
      chatId: request.chatId,
      moduleId: request.moduleId,
      reason: request.reason,
      state: request.state as "pending" | "approved" | "denied",
      configValues: request.configValues as Record<string, string> | undefined,
      createdAt: request.createdAt,
    };
  } catch (error) {
    console.error("Error getting module request:", error);
    throw new Error(`Failed to get module request: ${error}`);
  }
}

export async function updateModuleRequest(
  requestId: string,
  update: {
    state: "approved" | "denied";
    configValues?: Record<string, string>;
  },
) {
  try {
    const request = await db
      .select()
      .from(moduleRequestsTable)
      .where(eq(moduleRequestsTable.id, requestId))
      .then((rows) => rows[0]);

    if (!request) {
      throw new Error(`Module request with ID ${requestId} not found`);
    }

    // If approving, also enable the module for this chat
    if (update.state === "approved") {
      // Check if there's an existing record in the enabled table
      const existingEnabled = await db
        .select()
        .from(chatModulesEnabledTable)
        .where(
          and(
            eq(chatModulesEnabledTable.chatId, request.chatId),
            eq(chatModulesEnabledTable.moduleId, request.moduleId),
          ),
        )
        .then((rows) => rows[0]);

      if (existingEnabled) {
        // Update the existing record
        await db
          .update(chatModulesEnabledTable)
          .set({ enabled: true })
          .where(
            and(
              eq(chatModulesEnabledTable.chatId, request.chatId),
              eq(chatModulesEnabledTable.moduleId, request.moduleId),
            ),
          );
      } else {
        // Create a new record
        await db.insert(chatModulesEnabledTable).values({
          chatId: request.chatId,
          moduleId: request.moduleId,
          enabled: true,
        });
      }
    }

    // Update the request
    const updatedRequest = await db
      .update(moduleRequestsTable)
      .set({
        state: update.state,
        configValues: update.configValues || request.configValues,
        updatedAt: new Date(),
      })
      .where(eq(moduleRequestsTable.id, requestId))
      .returning();

    return {
      id: updatedRequest[0].id,
      chatId: updatedRequest[0].chatId,
      moduleId: updatedRequest[0].moduleId,
      reason: updatedRequest[0].reason,
      state: updatedRequest[0].state as "pending" | "approved" | "denied",
      configValues: updatedRequest[0].configValues as
        | Record<string, string>
        | undefined,
      createdAt: updatedRequest[0].createdAt,
    };
  } catch (error) {
    console.error("Error updating module request:", error);
    throw new Error(`Failed to update module request: ${error}`);
  }
}
