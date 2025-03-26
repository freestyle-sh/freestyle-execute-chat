"use server";

import { db } from "@/db";
import {
  freestyleModulesConfigurationsTable,
  freestyleModulesEnvironmentVariableRequirementsTable,
} from "@/db/schema";
import { stackServerApp } from "@/stack";
import { and, eq } from "drizzle-orm";

/**
 * Delete all configurations for a module
 */
export async function deleteModuleConfiguration(moduleId: string) {
  const user = await stackServerApp.getUser({
    or: "anonymous",
  });
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
}
