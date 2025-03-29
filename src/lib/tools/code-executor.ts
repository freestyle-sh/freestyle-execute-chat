import { z } from "zod";
import { executeTool } from "freestyle-sandboxes/ai";

/**
 * Generates a code executor tool that can execute JavaScript/TypeScript code
 * in a sandboxed environment with the specified node modules and environment variables.
 * 
 * @param apiKey The Freestyle API key
 * @param nodeModules Record of node module names and their versions
 * @param envVars Environment variables to make available to the executed code
 * @returns A code execution tool that can be used with AI models
 */
export function generateCodeExecutor(
  apiKey: string,
  nodeModules: Record<string, string>,
  envVars: Record<string, string>
) {
  const executor = executeTool({
    apiKey,
    nodeModules,
    envVars,
  });

  // Add OUTPUT_NAME parameter for tracking previous execution results
  executor.parameters = executor.parameters.extend({
    OUTPUT_NAME: z
      .string()
      .describe(
        "The name of the output variable, future code executions will be able to access this variable via process.env.PREV_EXEC_{OUTPUT_NAME}. No spaces or special characters are allowed. The name must start with a letter and can only contain letters, numbers, and underscores."
      ),
  });

  return executor;
}