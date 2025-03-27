"use client";

import type { ToolInvocation } from "ai";
import { FileQuestion } from "lucide-react";
import { ToolOutput, ToolOutputBadge } from "@/components/tool-output";

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
  // Extract result, handling both custom format and ToolInvocation
  let result:
    | {
        _type: "success" | "error" | "pending";
        result?: string;
        error?: string;
      }
    | undefined;

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

  // Get moduleIds as an array
  let moduleIds: string[] = [];
  if ("args" in request && request.args.moduleIds) {
    moduleIds = Array.isArray(request.args.moduleIds) 
      ? request.args.moduleIds 
      : [request.args.moduleIds];
  }

  const modulesList = moduleIds.length > 0 
    ? moduleIds.map((id, index) => (
        <span key={id}>
          <b>{id}</b>{index < moduleIds.length - 1 ? ", " : ""}
        </span>
      ))
    : <b>No modules</b>;

  return (
    <>
      <ToolOutput
        title={
          <>
            Loaded documentation for {modulesList} into context
          </>
        }
        icon={FileQuestion}
        badge={
          <ToolOutputBadge variant={badgeVariant}>
            Documentation
          </ToolOutputBadge>
        }
        className={className}
      />
    </>
  );
};
