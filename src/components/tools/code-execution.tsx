"use client"

import { ToolInvocation } from "ai";
import { Terminal } from "lucide-react";
import { ToolOutput, ToolOutputBadge } from "@/components/ui/tool-output";

type ExecutionResult = {
  _type: "success" | "error" | "pending";
  result?: unknown;
  error?: string;
  logs?: {
    message: string;
  }[];
};

export type CodeExecutionProps = {
  execution:
    | ToolInvocation
    | {
        args: {
          script: string;
        };
        result: ExecutionResult;
      };
  className?: string;
};

export const CodeExecution = ({ execution, className }: CodeExecutionProps) => {
  // Extract script and result, handling both custom format and ToolInvocation
  let script: string | undefined;
  let result: ExecutionResult | undefined;
  
  if ('args' in execution && execution.args.script) {
    script = execution.args.script;
  } else if ('input' in execution && typeof execution.input === 'object' && execution.input) {
    // Handle tool invocation format
    const input = execution.input as Record<string, unknown>;
    if ('script' in input && typeof input.script === 'string') {
      script = input.script;
    }
  }
  
  if ('result' in execution) {
    result = execution.result;
  } else if ('output' in execution && execution.output) {
    result = execution.output as ExecutionResult;
  }

  // Determine badge text and variant based on result
  let badgeText = "JavaScript";
  let badgeVariant: "default" | "success" | "error" | "pending" | "info" | "warning" = "info";

  return (
    <ToolOutput
      title="Code Execution"
      icon={Terminal}
      badge={<ToolOutputBadge variant={badgeVariant}>{badgeText}</ToolOutputBadge>}
      input={script}
      result={result}
      inputLanguage="javascript"
      className={className}
    />
  );
};