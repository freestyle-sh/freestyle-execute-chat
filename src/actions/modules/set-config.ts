"use server";
import { z } from "zod";
import { db } from "@/db";
import {
  freestyleModulesConfigurationsTable,
  freestyleModulesEnvironmentVariableRequirementsTable,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { stackServerApp } from "@/stack";
import { auth } from "../auth";

// Schema for configuration data
const configurationSchema = z.object({
  moduleId: z.string().uuid(),
  configurations: z.array(
    z.object({
      environmentVariableRequirementId: z.string().uuid(),
      value: z.string(),
    }),
  ),
});

export type ModuleConfigInput = z.infer<typeof configurationSchema>;

/**
 * Save module configuration
 */
export async function saveModuleConfiguration(
  moduleId: string,
  configs: Record<string, string>,
) {
  const user = await auth({
    or: "anonymous",
  });
  if (!user) {
    throw new Error("User not found");
  }

  const userId = user.id;

  // Transform the configs object into the expected format
  const configurations = Object.entries(configs).map(([envVarId, value]) => ({
    environmentVariableRequirementId: envVarId,
    value,
  }));

  // Validate the data
  const validatedData = configurationSchema.parse({
    moduleId,
    configurations,
  });

  // Validate that all environment variable requirements belong to the specified module
  const envVarRequirements = await db
    .select()
    .from(freestyleModulesEnvironmentVariableRequirementsTable)
    .where(
      eq(
        freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
        moduleId,
      ),
    );

  const validEnvVarIds = new Set(envVarRequirements.map((req) => req.id));

  for (const config of validatedData.configurations) {
    if (!validEnvVarIds.has(config.environmentVariableRequirementId)) {
      throw new Error(
        `Invalid environment variable requirement ID: ${config.environmentVariableRequirementId}`,
      );
    }
  }

  // Process each configuration
  await Promise.all(
    validatedData.configurations.map(async (config) => {
      // Check if there's an existing configuration for this user and env var
      const existingConfig = await db
        .select()
        .from(freestyleModulesConfigurationsTable)
        .where(
          and(
            eq(freestyleModulesConfigurationsTable.userId, userId),
            eq(
              freestyleModulesConfigurationsTable.environmentVariableId,
              config.environmentVariableRequirementId,
            ),
          ),
        )
        .then((rows) => rows[0]);

      if (existingConfig) {
        // Update existing configuration if value is different
        if (existingConfig.value !== config.value) {
          return db
            .update(freestyleModulesConfigurationsTable)
            .set({ value: config.value })
            .where(
              and(
                eq(freestyleModulesConfigurationsTable.userId, userId),
                eq(
                  freestyleModulesConfigurationsTable.environmentVariableId,
                  config.environmentVariableRequirementId,
                ),
              ),
            );
        }
        return { success: true, action: "unchanged" };
      }

      // Insert new configuration
      return db.insert(freestyleModulesConfigurationsTable).values({
        userId,
        environmentVariableId: config.environmentVariableRequirementId,
        value: config.value,
      });
    }),
  );

  return { success: true };
}
