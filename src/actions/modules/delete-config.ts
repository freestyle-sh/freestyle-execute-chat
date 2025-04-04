"use server";

import { db } from "@/db";
import {
  chatModulesEnabledTable,
  freestyleModulesConfigurationsTable,
  freestyleModulesEnvironmentVariableRequirementsTable,
} from "@/db/schema";
import { stackServerApp } from "@/stack";
import { and, eq } from "drizzle-orm";
import { auth } from "../auth";

/**
 * Delete all configurations for a module
 */
export async function deleteModuleConfiguration(moduleId: string) {
  const user = await auth({
    or: "anonymous",
  });
  if (!user) {
    throw new Error("User not found");
  }

  const userId = user.id;

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

  // Delete all configurations for this module and user
  await Promise.all(
    envVarRequirements.map(async (requirement) => {
      return await db
        .delete(freestyleModulesConfigurationsTable)
        .where(
          and(
            eq(freestyleModulesConfigurationsTable.userId, userId),
            eq(
              freestyleModulesConfigurationsTable.environmentVariableId,
              requirement.id,
            ),
          ),
        );
    }),
  );

  // Disable the module for chats where it's enabled.
  await db
    .update(chatModulesEnabledTable)
    .set({ enabled: false })
    .where(eq(chatModulesEnabledTable.moduleId, moduleId));
}
