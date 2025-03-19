"use client";

import type { ToolInvocation } from "ai";
import { cn } from "@/lib/utils";
import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockGroup,
} from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  type LucideIcon,
  ChevronDown,
  ChevronUp,
  FileText,
  Check,
} from "lucide-react";
import { type HTMLAttributes, type ReactNode, useState } from "react";
import { toast } from "sonner";

export type ToolResult = {
  _type: "success" | "error" | "pending";
  result?: unknown;
  error?: string;
  logs?: {
    message: string;
  }[];
};

export type ToolOutputProps = {
  // Container props
  className?: string;
  variant?: "default" | "success" | "error" | "pending";

  // Header content
  headerContent?: ReactNode;
  title?: ReactNode;
  icon?: LucideIcon;
  badge?: ReactNode;
  actions?: ReactNode;

  // Main content
  children?: ReactNode;
  content?: ReactNode;

  // For code-specific content
  input?: string | ReactNode;
  inputLanguage?: string;

  // For result handling
  result?: ToolResult;
  resultLanguage?: string;

  // Tool invocation data
  toolInvocation?: ToolInvocation;
};

// Copy button with feedback
const CopyButton = ({
  onClick,
  title,
}: {
  onClick: () => void;
  title: string;
}) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    onClick();
    setHasCopied(true);

    toast("Copied to clipboard");
    // Reset after 2 seconds
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 transition-all duration-200 hover:bg-muted/80 hover:text-foreground active:scale-95 cursor-pointer"
      onClick={handleCopy}
      title={title}
    >
      {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
};

export const ToolOutput = ({
  // Container props
  className,
  variant = "default",

  // Header content
  headerContent,
  title,
  icon: Icon,
  badge,
  actions,

  // Main content
  children,
  content,

  // For code-specific content
  input,
  inputLanguage = "text",

  // For result handling
  result,
  resultLanguage,

  // Tool invocation data
  toolInvocation,
}: ToolOutputProps) => {
  const [showLogs, setShowLogs] = useState(false);

  // Extract data from toolInvocation if provided
  let processedInput = input;
  let processedResult = result;

  if (toolInvocation) {
    // Extract input from tool invocation
    if (
      !processedInput &&
      "input" in toolInvocation &&
      typeof toolInvocation.input === "object" &&
      toolInvocation.input
    ) {
      const inputObj = toolInvocation.input as Record<string, unknown>;
      // Find first string property to use as input
      const firstStringProp = Object.entries(inputObj).find(
        ([_, value]) => typeof value === "string"
      );
      if (firstStringProp) {
        processedInput = firstStringProp[1] as string;
      }
    }

    // Extract result from tool invocation
    if (
      !processedResult &&
      "output" in toolInvocation &&
      toolInvocation.output
    ) {
      processedResult = toolInvocation.output as ToolResult;
    }
  }

  const isSuccess =
    variant === "success" || processedResult?._type === "success";
  const isError = variant === "error" || processedResult?._type === "error";
  const isPending =
    variant === "pending" || processedResult?._type === "pending";

  // Handle logs if they exist
  const logs = processedResult?.logs || [];
  // Only show logs section if we actually have logs
  const hasLogs = logs.length > 0;

  // Get the appropriate output to display
  let resultOutput = "";

  if (isSuccess && processedResult?.result) {
    // Format successful result based on type
    resultOutput =
      typeof processedResult.result === "object"
        ? JSON.stringify(processedResult.result, null, 2)
        : String(processedResult.result);
  } else if (isError && processedResult?.error) {
    // For errors, display the error message
    resultOutput = processedResult.error;
  }

  const copyInput = () => {
    if (typeof processedInput === "string") {
      navigator.clipboard.writeText(processedInput);
    }
  };

  const copyResult = () => {
    if (resultOutput) {
      navigator.clipboard.writeText(resultOutput);
    }
  };

  // Determine result language if not provided
  const effectiveResultLanguage =
    resultLanguage ||
    (typeof processedResult?.result === "object" ? "json" : "text");

  return (
    <div className={cn("my-4 w-full space-y-3", className)}>
      {/* Input Container */}
      {(processedInput ||
        headerContent ||
        title ||
        Icon ||
        badge ||
        actions) && (
        <CodeBlock>
          {/* Header */}
          {(headerContent || title || Icon || badge || actions) && (
            <CodeBlockGroup className="border-b border-border px-4 py-2">
              {headerContent || (
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    {title && (
                      <span className="text-sm font-medium">{title}</span>
                    )}
                    {badge && badge}
                  </div>
                  <div className="flex items-center">
                    {actions}
                    {typeof processedInput === "string" && (
                      <CopyButton onClick={copyInput} title="Copy code" />
                    )}
                  </div>
                </div>
              )}
            </CodeBlockGroup>
          )}

          {/* Custom children override everything else */}
          {children || (
            <>
              {/* Input/Content Section */}
              {content ? (
                <div className="p-4">{content}</div>
              ) : (
                processedInput &&
                (typeof processedInput === "string" ? (
                  <CodeBlockCode
                    code={processedInput}
                    language={inputLanguage}
                  />
                ) : (
                  <div className="p-4">{processedInput}</div>
                ))
              )}
            </>
          )}
        </CodeBlock>
      )}

      {/* Result Container */}
      {processedResult && (
        <CodeBlock
          className={cn(
            isSuccess
              ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
              : isError
              ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
              : isPending
              ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30"
              : "",
            "transition-colors duration-200"
          )}
        >
          {/* Result Header */}
          <CodeBlockGroup className="border-b border-border px-4 py-2">
            <div className="flex items-center gap-2">
              {isSuccess ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : isError ? (
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              )}
              <span className="text-sm font-medium">
                {isSuccess ? "Success" : isError ? "Error" : "Processing..."}
              </span>

              {hasLogs && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogs(!showLogs)}
                  className="ml-2 h-6 px-2 text-xs font-medium ring-offset-background transition-all hover:bg-muted active:scale-95 cursor-pointer"
                >
                  {showLogs ? (
                    <ChevronUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ChevronDown className="mr-1 h-3 w-3" />
                  )}
                  {logs.length > 0 ? `Logs (${logs.length})` : "Logs"}
                </Button>
              )}
            </div>

            {resultOutput && (
              <CopyButton onClick={copyResult} title="Copy result" />
            )}
          </CodeBlockGroup>

          {/* Result Content */}
          {resultOutput && (
            <CodeBlockCode
              code={resultOutput}
              language={effectiveResultLanguage}
            />
          )}

          {/* Logs Section */}
          {hasLogs && showLogs && (
            <div className="border-t border-border">
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Logs
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto p-4 text-xs font-mono">
                {logs.map((log: { message: string }, i: number) => (
                  <div
                    key={i.toString()}
                    className="whitespace-pre-wrap py-0.5 text-muted-foreground"
                  >
                    <span className="mr-2 inline-block w-5 text-right text-muted-foreground/60">
                      {i + 1}
                    </span>
                    {log.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CodeBlock>
      )}
    </div>
  );
};

export const ToolOutputBadge = ({
  children,
  className,
  variant = "default",
  ...props
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "success" | "error" | "pending" | "info" | "warning";
} & HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-200",
        variant === "success" &&
          "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
        variant === "error" &&
          "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
        variant === "pending" &&
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
        variant === "info" &&
          "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
        variant === "warning" &&
          "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
        variant === "default" &&
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
