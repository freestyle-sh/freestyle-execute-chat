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
