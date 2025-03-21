"use server";
import { db } from "@/db";
import { STACKAUTHID } from "@/actions/auth/tempuserid";
import {
  freestyleModulesConfigurationsTable,
  freestyleModulesEnvironmentVariableRequirementsTable,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Delete all configurations for a module
 */
export async function deleteModuleConfiguration(moduleId: string) {
  const userId = STACKAUTHID;

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
      return db
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

  return { success: true };
}
