"use server";

import { db } from "@/db";
import {
  freestyleModulesConfigurationsTable,
  freestyleModulesEnvironmentVariableRequirementsTable,
} from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { stackServerApp } from "@/stack";
import { auth } from "../auth";

/**
 * Get configurations for multiple modules at once
 * This is more efficient than fetching them one by one
 */
export async function getAllModuleConfigurations(moduleIds: string[]) {
  "use server";

  if (!moduleIds.length) {
    return {};
  }

  // Use a placeholder user ID for now
  const user = await auth({
    or: "anonymous",
  });
  if (!user) {
    throw new Error("User not found");
  }

  const userId = user.id;

  // Get all environment variable requirements for these modules
  const requirements = await db
    .select()
    .from(freestyleModulesEnvironmentVariableRequirementsTable)
    .where(
      inArray(
        freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
        moduleIds,
      ),
    );

  // Get existing configurations for these modules and user
  const configurations = await db
    .select()
    .from(freestyleModulesConfigurationsTable)
    .innerJoin(
      freestyleModulesEnvironmentVariableRequirementsTable,
      eq(
        freestyleModulesConfigurationsTable.environmentVariableId,
        freestyleModulesEnvironmentVariableRequirementsTable.id,
      ),
    )
    .where(
      and(
        inArray(
          freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
          moduleIds,
        ),
        eq(freestyleModulesConfigurationsTable.userId, userId),
      ),
    );

  // Group configurations by module ID
  const configsByModule: Record<string, any[]> = {};

  // Initialize with empty arrays for all requested modules
  moduleIds.forEach((id) => {
    configsByModule[id] = [];
  });

  // Map configurations to a more user-friendly format and group by module
  configurations.forEach((config) => {
    const moduleId =
      config.FreestyleModulesEnvironmentVariableRequirements.moduleId;

    if (!configsByModule[moduleId]) {
      configsByModule[moduleId] = [];
    }

    configsByModule[moduleId].push({
      environmentVariableRequirementId:
        config.FreestyleModulesEnvironmentVariableRequirements.id,
      name: config.FreestyleModulesEnvironmentVariableRequirements.name,
      value: config.FreestyleModulesConfigurations.value,
    });
  });

  return configsByModule;
}

