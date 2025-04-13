import type { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { tool } from "ai";
import { z } from "zod";

export function moduleRequestTool(modules: ModuleWithRequirements[]) {
  const configuredModules = modules.filter((m) => m.isConfigured);

  const enabledModules = configuredModules.filter((m) => m.isEnabled);
  const nodeModules = configuredModules.reduce(
    (acc: Set<string>, module: ModuleWithRequirements) => {
      for (const nodeModule of Object.keys(module.nodeModules)) {
        acc.add(nodeModule);
      }
      return acc;
    },
    new Set<string>(),
  );

  const availableModules = configuredModules.filter((m) => !m.isEnabled);
  const unconfiguredModules = modules.filter((m) => !m.isConfigured);

  return tool({
    description: `Request a module to be enabled or configured for the current chat.

ONLY REQUEST modules that are not currently enabled. DO NOT request modules that are already available to you.

          Currently enabled freestyle modules (DO NOT REQUEST THESE): ${
            enabledModules.length > 0
              ? enabledModules
                  .map((module) => `${module.name} (id: ${module.id})`)
                  .join(", ")
              : "None"
          }

          Enabled node modules (already available to use): ${
            Object.keys(nodeModules).length > 0
              ? Object.keys(nodeModules).join(", ")
              : "None"
          }

          Available but not enabled freestyle modules (ONLY REQUEST FROM THIS LIST if needed): ${availableModules
            .map((module) => `${module.name} (id: ${module.id})`)
            .join(", ")}

          Unconfigured freestyle modules (DO NOT REQUEST THESE UNLESS NECESSARY): ${unconfiguredModules
            .map((module) => `${module.name} (id: ${module.id})`)
            .join(", ")}

          IMPORTANT: Each freestyle module comes with its own set of node modules. If the node module you need appears in the list of enabled node modules above, you DO NOT need to request additional modules.
          `,
    parameters: z.object({
      moduleId: z.string().describe("ID of the module to request access to"),
      reason: z
        .string()
        .describe(
          "Explain why this module is needed and what functionality it will provide",
        ),
    }),
  });
}

