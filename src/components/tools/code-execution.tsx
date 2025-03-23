"use client";

import type { ToolInvocation } from "ai";
import { Terminal, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { ToolOutput, ToolOutputBadge } from "@/components/tool-output";
import { cn } from "@/lib/utils";
import { CodeBlockCode } from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
  const [showLogs, setShowLogs] = useState(false);

  // Extract script and result, handling both custom format and ToolInvocation
  let script: string | undefined;
  let result: ExecutionResult | undefined;

  if ("args" in execution && execution.args.script) {
    script = execution.args.script;
  } else if (
    "input" in execution &&
    typeof execution.input === "object" &&
    execution.input
  ) {
    // Handle tool invocation format
    const input = execution.input as Record<string, unknown>;
    if ("script" in input && typeof input.script === "string") {
      script = input.script;
    }
  }

  if ("result" in execution) {
    result = execution.result;
  } else if ("output" in execution && execution.output) {
    result = execution.output as ExecutionResult;
  }

  // Determine badge text and variant based on result
  const badgeText = "JavaScript";
  const badgeVariant:
    | "default"
    | "success"
    | "error"
    | "pending"
    | "info"
    | "warning" =
    result?._type === "success"
      ? "success"
      : result?._type === "error"
        ? "error"
        : result?._type === "pending"
          ? "pending"
          : "info";

  // Adding CSS for pulse animation (this will use Tailwind's built-in pulse);

  // Render the content for the ToolOutput component
  const renderContent = () => {
    if (!script) return null;

    const isSuccess = result?._type === "success";
    const isError = result?._type === "error";
    const isPending = result?._type === "pending" || !result;
    const logs = result?.logs || [];
    const hasLogs = logs.length > 0;

    // Format the result for display
    let formattedResult = "";
    if (isSuccess && result?.result) {
      formattedResult =
        typeof result.result === "object"
          ? JSON.stringify(result.result, null, 2)
          : String(result.result);
    } else if (isError && result?.error) {
      formattedResult = result.error;
    }

    return (
      <div className="space-y-4">
        {/* Section for the code input */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            JavaScript code execution
          </p>
          <div className="border rounded-md overflow-hidden">
            <CodeBlockCode code={script} language="javascript" />
          </div>
        </div>

        {/* Section for the result */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium flex items-center gap-2">
              {isSuccess ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
                  <span className="text-green-600 dark:text-green-400">
                    Execution completed successfully
                  </span>
                </>
              ) : isError ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
                  <span className="text-red-600 dark:text-red-400">
                    Execution failed
                  </span>
                </>
              ) : (
                <>
                  <div className="relative flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-400 animate-pulse" />
                    <span className="absolute w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-400 animate-ping" />
                  </div>
                  <span className="text-yellow-600 dark:text-yellow-400">
                    Execution in progress...
                  </span>
                </>
              )}
            </div>

            {hasLogs && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogs(!showLogs)}
                className="h-6 px-2 text-xs font-medium ring-offset-background transition-all hover:bg-muted active:scale-95 cursor-pointer"
              >
                {showLogs ? (
                  <ChevronUp className="mr-1 h-3 w-3" />
                ) : (
                  <ChevronDown className="mr-1 h-3 w-3" />
                )}
                {`Logs (${logs.length})`}
              </Button>
            )}
          </div>

          {isPending ? (
            <div className="border rounded-md p-10 bg-muted/10 flex justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 text-yellow-600 dark:text-yellow-400 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Running code...
                </span>
              </div>
            </div>
          ) : formattedResult ? (
            <div className="border rounded-md overflow-hidden">
              <CodeBlockCode
                code={formattedResult}
                language={
                  isError
                    ? "bash"
                    : typeof result?.result === "object"
                      ? "json"
                      : "text"
                }
              />
            </div>
          ) : null}
        </div>

        {/* Section for logs - only show when showLogs is true */}
        {hasLogs && showLogs && (
          <div>
            <div className="flex items-center mb-2">
              <div className="text-sm font-medium text-muted-foreground">
                Logs
              </div>
            </div>
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-40 overflow-y-auto">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={cn(
                      "py-1 px-3 font-mono text-xs",
                      i % 2 === 0 ? "bg-muted/10" : "bg-transparent",
                    )}
                  >
                    <span className="text-muted-foreground/60 mr-2">
                      {i + 1}
                    </span>
                    <span className="whitespace-pre-wrap">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <ToolOutput
      title="Code Execution"
      icon={Terminal}
      badge={
        <ToolOutputBadge variant={badgeVariant}>{badgeText}</ToolOutputBadge>
      }
      content={renderContent()}
      className={className}
    />
  );
};

