"use server";

import { db } from "@/db";
import {
  freestyleModulesConfigurationsTable,
  freestyleModulesEnvironmentVariableRequirementsTable,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { stackServerApp } from "@/stack";

/**
 * Get module configuration for a specific module
 */
export async function getModuleConfiguration(moduleId: string) {
  "use server";

  // Use a placeholder user ID for now
  const user = await stackServerApp.getUser({
    or: "anonymous",
  });
  const userId = user.id;
  // Get all environment variable requirements for this module
  const requirements = await db
    .select()
    .from(freestyleModulesEnvironmentVariableRequirementsTable)
    .where(
      eq(
        freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
        moduleId
      )
    );

  // Get existing configurations for this module and user
  const configurations = await db
    .select()
    .from(freestyleModulesConfigurationsTable)
    .innerJoin(
      freestyleModulesEnvironmentVariableRequirementsTable,
      eq(
        freestyleModulesConfigurationsTable.environmentVariableId,
        freestyleModulesEnvironmentVariableRequirementsTable.id
      )
    )
    .where(
      and(
        eq(
          freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
          moduleId
        ),
        eq(freestyleModulesConfigurationsTable.userId, userId)
      )
    );

  // Map configurations to a more user-friendly format
  const configMap = configurations.map((config) => ({
    environmentVariableRequirementId:
      config.FreestyleModulesEnvironmentVariableRequirements.id,
    name: config.FreestyleModulesEnvironmentVariableRequirements.name,
    value: config.FreestyleModulesConfigurations.value,
  }));

  return {
    moduleId,
    requirements,
    configurations: configMap,
  };
}
