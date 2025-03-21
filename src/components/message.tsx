"use client";

import { getStructuredDataResponse } from "@/actions/chats/get-structured-data";
import LogoComponent from "./logo";
import { CodeExecution } from "./tools/code-execution";
import { SendFeedback } from "./tools/send-feedback";
import { RequestDocs } from "./tools/request-docs";
import { StructuredDataRequest } from "./tools/structured-data-request";
// import type { Components } from "react-markdown";
import { Message, MessageContent, MessageAvatar } from "./ui/message";
import type { ToolInvocation, UIMessage } from "ai";
import { useState, useEffect } from "react";
// Markdown components for future use if needed
/*
const markdownComponents: Partial<Components> = {
  h1: ({ children }) => <h1 className="text-2xl font-bold mb-2">{children}</h1>,
};
*/

export function UserMessage({
  chatId,
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
  const [formResponse, setFormResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Extract toolCallId from request
  const toolCallId = request.toolCallId;

  useEffect(() => {
    const fetchFormResponse = async () => {
      try {
        if (!toolCallId || !chatId) {
          console.error("Missing toolCallId or chatId", { toolCallId, chatId });
          setLoading(false);
          return;
        }

        const response = await getStructuredDataResponse(chatId, toolCallId);
        setFormResponse(response);
      } catch (error) {
        console.error("Error fetching form response:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormResponse();

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchFormResponse, 2000);
    return () => clearInterval(interval);
  }, [toolCallId, chatId]);

  if (loading) {
    return (
      <div className="animate-pulse p-4 rounded-md bg-muted/20 border">
        <div className="h-4 w-3/4 bg-muted rounded mb-2" />
        <div className="h-4 w-1/2 bg-muted rounded" />
      </div>
    );
  }

  if (!formResponse) {
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
      formData={formResponse.formData}
    />
  );
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
