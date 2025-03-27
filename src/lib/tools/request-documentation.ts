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
    description: "Request documentation for multiple modules",
    parameters: z.object({
      moduleIds: z
        .array(
          z.enum(enabledModulesWithDocs as unknown as [string, ...string[]])
        )
        .min(1)
        .describe("The IDs of the modules to request documentation for"),
    }),

    execute: async ({ moduleIds }) => {
      const moduleDocumentation = moduleIds.map((moduleId) => {
        const freestyleModule = enabledModules.find(
          (v) => v.name === moduleId
        )!;
        return `Documentation for ${freestyleModule.name}:\n${freestyleModule.documentation}`;
      });

      console.log(moduleDocumentation);
      return moduleDocumentation.join("\n\n");
    },
  });
};
