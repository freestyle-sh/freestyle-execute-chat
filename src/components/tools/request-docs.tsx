"use client";

import type { ToolInvocation } from "ai";
import { FileQuestion } from "lucide-react";
import { ToolOutput, ToolOutputBadge } from "@/components/ui/tool-output";

export type RequestDocsProps = {
  request:
    | ToolInvocation
    | {
        args: {
          query: string;
        };
        result?: {
          _type: "success" | "error" | "pending";
          result?: string;
          error?: string;
        };
      };
  className?: string;
};

export const RequestDocs = ({ request, className }: RequestDocsProps) => {
  // Extract query and result, handling both custom format and ToolInvocation
  let query: string | undefined;
  let result:
    | {
        _type: "success" | "error" | "pending";
        result?: string;
        error?: string;
      }
    | undefined;

  if ("args" in request && request.args.query) {
    query = request.args.query;
  } else if (
    "input" in request &&
    typeof request.input === "object" &&
    request.input
  ) {
    // Handle tool invocation format
    const input = request.input as Record<string, unknown>;
    if ("query" in input && typeof input.query === "string") {
      query = input.query;
    }
  }

  if ("result" in request && request.result) {
    result = request.result;
  } else if ("output" in request && request.output) {
    result = request.output as typeof result;
  }

  // Determine badge variant based on result
  const badgeVariant:
    | "default"
    | "success"
    | "error"
    | "pending"
    | "info"
    | "warning" = !result
    ? "default"
    : result._type === "success"
    ? "success"
    : result._type === "error"
    ? "error"
    : result._type === "pending"
    ? "pending"
    : "info";

  return (
    <>
      <ToolOutput
        title="Documentation Request"
        icon={FileQuestion}
        badge={
          <ToolOutputBadge variant={badgeVariant}>
            Documentation
          </ToolOutputBadge>
        }
        input={query && `Query: ${query}`}
        result={result}
        className={className}
      />
    </>
  );
};
