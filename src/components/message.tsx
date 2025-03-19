"use client";

import LogoComponent from "./logo";
import { CodeExecution } from "./tools/code-execution";
import { SendFeedback } from "./tools/send-feedback";
// import type { Components } from "react-markdown";
import { Message, MessageContent, MessageAvatar } from "./ui/message";
import type { UIMessage } from "ai";
// Markdown components for future use if needed
/*
const markdownComponents: Partial<Components> = {
  h1: ({ children }) => <h1 className="text-2xl font-bold mb-2">{children}</h1>,
};
*/

export function UserMessage({ message }: { message: UIMessage }) {
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
        <Message shadow-sm
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

export function AIMessage({ message }: { message: UIMessage }) {
  return (
    <>
      {message.parts.map((part, index) => (
        <Message
          key={`msg-${message.id}-part-${index.toString()}`}
          className="justify-start animate-slide-up max-w-[85%]"
        >
          {index === 0 && (
            // <MessageAvatar
            //   src="/avatars/ai.png"
            //   alt="AI"
            //   fallback="AI"
            //   className="mt-1"
            // />
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
            </>
          )}
        </Message>
      ))}
    </>
  );
}

export default function ChatMessage({ message }: { message: UIMessage }) {
  switch (message.role) {
    case "user":
      return <UserMessage message={message} />;
    default:
      return <AIMessage message={message} />;
  }
}
