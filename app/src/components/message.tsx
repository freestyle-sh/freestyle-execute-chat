"use client";

import {
  getOrCreateStructuredDataResponse,
  getStructuredDataResponse,
} from "@/actions/chats/get-structured-data";
import {
  getModuleRequest,
  getOrCreateModuleRequest,
} from "@/actions/modules/request-module";
import LogoComponent from "./logo";
import { CodeExecution } from "./tools/code-execution";
import { ModuleRequest } from "./tools/module-request";
import { SendFeedback } from "./tools/send-feedback";
import { RequestDocs } from "./tools/request-docs";
import { StructuredDataRequest } from "./tools/structured-data-request";
import { Message, MessageContent } from "./ui/message";
import type { ToolInvocation, UIMessage } from "ai";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";

export function UserMessage({
  chatId: _,
  message,
}: {
  chatId: string;
  message: UIMessage;
}) {
  if (!message.parts || message.parts.length === 0) {
    return (
      <Message className="justify-end animate-slide-in-right">
        <MessageContent className="bg-primary/10 rounded-2xl rounded-br-none border border-primary/10 transition-all duration-200">
          {message.content}
        </MessageContent>
      </Message>
    );
  }

  return (
    <>
      {message.parts.map((part, index) => (
        <Message
          key={`msg-${message.id}-part-${index.toString()}`}
          className="justify-end animate-slide-in-right"
        >
          {part.type === "text" && (
            <MessageContent className="bg-primary/10 rounded-2xl rounded-br-none border border-primary/10 transition-all duration-200">
              {part.text}
            </MessageContent>
          )}
        </Message>
      ))}
    </>
  );
}

export function AIMessage({
  chatId,
  message,
}: {
  chatId: string;
  message: UIMessage;
}) {
  return (
    <>
      {message.parts.map((part, index) => (
        <Message
          key={`msg-${message.id}-part-${index.toString()}`}
          className="justify-start animate-slide-up max-w-[85%]"
        >
          {index === 0 && (
            <div className="size-9 bg-primary/5 border rounded-full aspect-square flex items-center justify-center">
              <LogoComponent className=" size-6 stroke-primary" />
            </div>
          )}
          {index !== 0 && <div className="w-8" />} {/* Spacing for alignment */}
          {part.type === "text" && (
            <MessageContent
              key={`msg-${message.id}-content-${index.toString()}`}
              markdown
              className="bg-transparent p-0 transition-all duration-200 dark:prose-invert"
            >
              {part.text}
            </MessageContent>
          )}
          {part.type === "tool-invocation" && (
            <>
              {part.toolInvocation.toolName === "codeExecutor" && (
                <CodeExecution execution={part.toolInvocation} />
              )}
              {part.toolInvocation.toolName === "sendFeedback" && (
                <SendFeedback feedback={part.toolInvocation} />
              )}
              {part.toolInvocation.toolName === "requestDocumentation" && (
                <RequestDocs request={part.toolInvocation} />
              )}
              {part.toolInvocation.toolName === "structuredDataRequest" && (
                <StructuredDataRequestWrapper
                  request={part.toolInvocation}
                  chatId={chatId}
                />
              )}
              {part.toolInvocation.toolName === "moduleRequest" && (
                <ModuleRequestWrapper
                  request={part.toolInvocation}
                  chatId={chatId}
                />
              )}
            </>
          )}
        </Message>
      ))}
    </>
  );
}

function StructuredDataRequestWrapper({
  request,
  chatId,
}: {
  request: ToolInvocation;
  chatId: string;
}) {
  const toolCallId = request.toolCallId;

  const {
    data: formResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["formResponse", chatId, toolCallId],
    queryFn: async () => {
      if (!toolCallId || !chatId) {
        throw new Error("Missing toolCallId or chatId");
      }
      const response = await getOrCreateStructuredDataResponse(
        request.args.title,
        chatId,
        toolCallId,
      );
      return response || null;
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse p-4 rounded-md bg-muted/20 border">
        <div className="h-4 w-3/4 bg-muted rounded mb-2" />
        <div className="h-4 w-1/2 bg-muted rounded" />
      </div>
    );
  }

  if (error || !formResponse) {
    return (
      <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-700 dark:text-red-400">
          Error: Could not load the data request form. Please try again.
        </p>
      </div>
    );
  }

  return (
    <StructuredDataRequest
      request={request}
      formResponseId={formResponse.id}
      state={formResponse.state}
      formData={formResponse.formData as Record<string, unknown> | null}
    />
  );
}

function ModuleRequestWrapper({
  request,
  chatId,
}: {
  request: ToolInvocation;
  chatId: string;
}) {
  const toolCallId = request.toolCallId;

  const {
    data: moduleRequest,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["moduleRequest", toolCallId],
    queryFn: async () => {
      if (!toolCallId || !chatId) {
        throw new Error("Missing toolCallId or chatId");
      }

      // First, ensure a module request exists in the database
      await getOrCreateModuleRequest({
        chatId,
        moduleId: request.args.moduleId,
        toolCallId,
        reason: request.args.reason,
      });

      // Then fetch the latest state
      return getModuleRequest(toolCallId);
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse p-4 rounded-md bg-muted/20 border">
        <div className="h-4 w-3/4 bg-muted rounded mb-2" />
        <div className="h-4 w-1/2 bg-muted rounded" />
      </div>
    );
  }

  if (error || !moduleRequest) {
    return (
      <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-700 dark:text-red-400">
          Error: Could not load the module request. Please try again.
        </p>
      </div>
    );
  }

  return <ModuleRequest request={request} />;
}

export default function ChatMessage({
  chatId,
  message,
}: {
  chatId: string;
  message: UIMessage;
}) {
  switch (message.role) {
    case "user":
      return <UserMessage chatId={chatId} message={message} />;
    default:
      return <AIMessage chatId={chatId} message={message} />;
  }
}
