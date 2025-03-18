"use client"

import { ToolInvocation } from "ai";
import { cn } from "@/lib/utils";
import { CodeBlock, CodeBlockCode, CodeBlockGroup } from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Copy, Terminal } from "lucide-react";
import { useState } from "react";

type ExecutionResult = {
  _type: "success" | "error";
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

  const isSuccess = result?._type === "success";
  const isError = result?._type === "error";

  // Handle logs if they exist
  const logs = result?.logs || [];
  // Only show logs section if we actually have logs
  const hasLogs = logs.length > 0;

  // Get the appropriate output to display
  let resultOutput = '';
  
  if (isSuccess && result?.result) {
    // Format successful result as JSON string with pretty print
    resultOutput = typeof result.result === 'object' 
      ? JSON.stringify(result.result, null, 2)
      : String(result.result);
  } else if (isError && result?.error) {
    // For errors, display the error message
    resultOutput = result.error;
  }

  const copyScript = () => {
    if (script) {
      navigator.clipboard.writeText(script);
    }
  };

  const copyResult = () => {
    if (resultOutput) {
      navigator.clipboard.writeText(resultOutput);
    }
  };

  return (
    <div className={cn("my-4 w-full space-y-2", className)}>
      {script && (
        <CodeBlock>
          <CodeBlockGroup className="border-b border-border px-4 py-2">
            <div className="flex items-center">
              <Terminal className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Code Execution</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyScript}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CodeBlockGroup>
          <CodeBlockCode code={script} language="javascript" />
        </CodeBlock>
      )}

      {result && (
        <CodeBlock className={cn(
          isSuccess ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30" :
          isError ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30" :
          "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30"
        )}>
          <CodeBlockGroup className="border-b border-border px-4 py-2">
            <div className="flex items-center">
              {isSuccess ? (
                <CheckCircle className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
              ) : isError ? (
                <XCircle className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <Clock className="mr-2 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              )}
              <span className="text-sm font-medium">
                {isSuccess ? "Execution Successful" : isError ? "Execution Failed" : "Executing..."}
              </span>
            </div>
            {resultOutput && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyResult}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </CodeBlockGroup>

          {resultOutput && (
            <CodeBlockCode 
              code={resultOutput} 
              language={typeof result.result === 'object' ? 'json' : 'text'} 
            />
          )}

          {hasLogs && (
            <>
              <div className="border-t border-border px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLogs(!showLogs)}
                  className="text-xs font-medium"
                >
                  {showLogs ? "Hide Logs" : logs.length > 0 ? `Show Logs (${logs.length})` : "Show Logs"}
                </Button>
              </div>
              
              {showLogs && (
                <div className="max-h-60 overflow-y-auto border-t border-border px-4 py-2 text-xs font-mono">
                  {logs.map((log: { message: string }, i: number) => (
                    <div key={i} className="whitespace-pre-wrap py-1">
                      {log.message}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CodeBlock>
      )}
    </div>
  );
};