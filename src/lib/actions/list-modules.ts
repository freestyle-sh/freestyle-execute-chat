"use server";
import { db } from "@/db";
import {
  type FreestyleModule,
  freestyleModulesConfigurationsTable,
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
  chatModulesEnabledTable,
} from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { STACKAUTHID } from "./tempuserid";
import { z } from "zod";

export type ModuleWithRequirements = FreestyleModule & {
  environmentVariableRequirements: {
    id: string;
    moduleId: string;
    name: string;
    description: string | null;
    example: string | null;
    required: boolean;
    public: boolean;
  }[];
  isConfigured: boolean;
  isEnabled?: boolean;
  configurations: {
    userId: string;
    environmentVariableId: string;
    value: string;
    id: string;
    moduleId: string;
    name: string;
    description: string | null;
    example: string | null;
    required: boolean;
    public: boolean;
  }[];
};

export async function listModules(
  chatId?: string,
): Promise<ModuleWithRequirements[]> {
  "use server";

  // Use a placeholder user ID until authentication is implemented
  const userId = STACKAUTHID;

  // Get all modules ordered by priority
  const modules = await db
    .select()
    .from(freestyleModulesTable)
    .orderBy(desc(freestyleModulesTable.priority));

  // For each module, get its environment variable requirements and check if it's configured, and get the environment variables
  const modulesWithRequirements = await Promise.all(
    modules.map(async (module) => {
      const environmentVariableRequirements = await db
        .select()
        .from(freestyleModulesEnvironmentVariableRequirementsTable)
        .where(
          eq(
            freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
            module.id,
          ),
        );

      // Get existing configurations for this module and user
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
            eq(
              freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
              module.id,
            ),
            eq(freestyleModulesConfigurationsTable.userId, userId),
          ),
        );

      // Determine if module is configured
      const isConfigured = determineIfModuleIsConfigured(
        environmentVariableRequirements,
        configurations.map((config) => ({
          environmentVariableRequirementId:
            config.FreestyleModulesEnvironmentVariableRequirements.id,
          value: config.FreestyleModulesConfigurations.value,
        })),
      );

      // If chatId is provided, check if the module is enabled for this chat
      let isEnabled = undefined;
      if (chatId) {
        const enabledEntry = await db
          .select()
          .from(chatModulesEnabledTable)
          .where(
            and(
              eq(chatModulesEnabledTable.chatId, chatId),
              eq(chatModulesEnabledTable.moduleId, module.id),
            ),
          )
          .then((rows) => rows[0]);

        // If there's an entry, use its enabled state, otherwise default to false (not enabled)
        // This ensures only explicitly enabled modules are active
        isEnabled = enabledEntry ? enabledEntry.enabled : false;
      }

      return {
        ...module,
        environmentVariableRequirements,
        isConfigured,
        configurations: configurations.map((config) => ({
          ...config.FreestyleModulesEnvironmentVariableRequirements,
          ...config.FreestyleModulesConfigurations,
        })),
        isEnabled,
      };
    }),
  );

  return modulesWithRequirements;
}

// Helper function to determine if a module is configured
function determineIfModuleIsConfigured(
  requirements: {
    id: string;
    required: boolean;
  }[],
  configurations: {
    environmentVariableRequirementId: string;
    value: string;
  }[],
): boolean {
  const hasRequiredConfigs = requirements.some((req) => req.required);

  if (hasRequiredConfigs) {
    // If the module has required configs, check that all required ones are filled
    return requirements
      .filter((req) => req.required)
      .every((req) => {
        const config = configurations.find(
          (c) => c.environmentVariableRequirementId === req.id,
        );
        return config && config.value.trim() !== "";
      });
  }

  // If no required configs, then it's configured if any config exists
  return configurations.length > 0;
}

/**
 * Get module configuration for a specific module
 */
export async function getModuleConfiguration(moduleId: string) {
  "use server";

  // Use a placeholder user ID for now
  const userId = STACKAUTHID;

  // Get all environment variable requirements for this module
  const requirements = await db
    .select()
    .from(freestyleModulesEnvironmentVariableRequirementsTable)
    .where(
      eq(
        freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
        moduleId,
      ),
    );

  // Get existing configurations for this module and user
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
        eq(
          freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
          moduleId,
        ),
        eq(freestyleModulesConfigurationsTable.userId, userId),
      ),
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
  "use server";

  const userId = STACKAUTHID;

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

