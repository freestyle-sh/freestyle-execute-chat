import { FreestyleModule } from "@/db/schema";
import { tool } from "ai";
import { z } from "zod";

export const requestDocumentationTool = (enabledModules: FreestyleModule[]) => {
  const enabledModulesWithDocs = enabledModules
    .filter((v) => v.documentation)
    .map((v) => v.name) as string[];

  if (enabledModulesWithDocs.length === 0) {
    return undefined;
  }

  return tool({
    description: "Request documentation for a module",
    parameters: z.object({
      moduleId: z
        .enum(enabledModulesWithDocs as unknown as [string, ...string[]])
        .describe("The ID of the module to request documentation for"),
    }),

    execute: async ({ moduleId }) => {
      const freestyleModule = enabledModules.find((v) => v.name === moduleId)!;

      return `Documentation for ${freestyleModule.name}:\n${freestyleModule.documentation}`;
    },
  });
};
