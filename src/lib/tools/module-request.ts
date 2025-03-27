import { tool } from "ai";
import { z } from "zod";

export function moduleRequestTool() {
  return tool({
    description:
      "Request a module to be enabled or configured for the current chat",
    parameters: z.object({
      moduleId: z.string().describe("ID of the module to request access to"),
      reason: z
        .string()
        .describe(
          "Explain why this module is needed and what functionality it will provide",
        ),
      configValues: z
        .record(z.string())
        .optional()
        .describe(
          "Optional configuration values for the module as key-value pairs",
        ),
    }),
  });
}