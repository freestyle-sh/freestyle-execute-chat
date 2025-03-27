"use server";

import { db } from "@/db";
import {
  freestyleModulesTable,
  chatModulesEnabledTable,
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesConfigurationsTable,
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

export async function requestModuleAccess({
  chatId,
  moduleId,
  reason,
  configValues,
}: {
  chatId: string;
  moduleId: string;
  reason: string;
  configValues?: Record<string, string>;
}): Promise<ModuleRequestResponse> {
  try {
    // Get the current user
    const user = await stackServerApp.getUser({
      or: "anonymous",
    });
    const userId = user.id;

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

    // If the module is already enabled, return success
    if (existingEnabled?.enabled) {
      return {
        id: `${chatId}-${moduleId}`,
        chatId,
        moduleId,
        reason,
        state: "approved",
        configValues,
        createdAt: new Date(),
      };
    }

    // Enable the module for this chat
    if (existingEnabled) {
      await db
        .update(chatModulesEnabledTable)
        .set({ enabled: true })
        .where(
          and(
            eq(chatModulesEnabledTable.chatId, chatId),
            eq(chatModulesEnabledTable.moduleId, moduleId),
          ),
        );
    } else {
      await db.insert(chatModulesEnabledTable).values({
        chatId,
        moduleId,
        enabled: true,
      });
    }

    // If configuration values were provided, save them
    if (configValues && Object.keys(configValues).length > 0) {
      // Get all environment variable requirements for this module
      const envVarRequirements = await db
        .select()
        .from(freestyleModulesEnvironmentVariableRequirementsTable)
        .where(
          eq(
            freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
            moduleId,
          ),
        );

      const validEnvVarMap = envVarRequirements.reduce(
        (acc, req) => {
          acc[req.name] = req.id;
          return acc;
        },
        {} as Record<string, string>,
      );

      // Process each configuration value
      for (const [key, value] of Object.entries(configValues)) {
        const envVarId = validEnvVarMap[key];
        if (!envVarId) continue; // Skip if not a valid environment variable

        // Check if there's an existing configuration
        const existingConfig = await db
          .select()
          .from(freestyleModulesConfigurationsTable)
          .where(
            and(
              eq(freestyleModulesConfigurationsTable.userId, userId),
              eq(
                freestyleModulesConfigurationsTable.environmentVariableId,
                envVarId,
              ),
            ),
          )
          .then((rows) => rows[0]);

        if (existingConfig) {
          // Update existing configuration
          await db
            .update(freestyleModulesConfigurationsTable)
            .set({ value })
            .where(
              and(
                eq(freestyleModulesConfigurationsTable.userId, userId),
                eq(
                  freestyleModulesConfigurationsTable.environmentVariableId,
                  envVarId,
                ),
              ),
            );
        } else {
          // Insert new configuration
          await db.insert(freestyleModulesConfigurationsTable).values({
            userId,
            environmentVariableId: envVarId,
            value,
          });
        }
      }
    }

    // Return the result
    return {
      id: `${chatId}-${moduleId}`,
      chatId,
      moduleId,
      reason,
      state: "approved",
      configValues,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error requesting module access:", error);
    throw new Error(`Failed to request module access: ${error}`);
  }
}

