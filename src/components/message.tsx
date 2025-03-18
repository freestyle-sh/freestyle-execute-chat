"use client";

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
        <MessageContent className="bg-primary/10 rounded-2xl rounded-br-none shadow-sm border border-primary/10 transition-all duration-200">
          {message.content}
        </MessageContent>
      </Message>
    );
  }

  return (
    <>
      {message.parts.map((part, index) => (
        <Message key={index} className="justify-end animate-slide-in-right">
          {part.type === "text" ? (
            <MessageContent className="bg-primary/10 rounded-2xl rounded-br-none shadow-sm border border-primary/10 transition-all duration-200">
              part.text
            </MessageContent>
          ) : (
            <pre className="p-2 bg-muted rounded overflow-auto whitespace-pre">
              <code>{JSON.stringify(part, null, 2)}</code>
            </pre>
          )}
        </Message>
      ))}
    </>
  );
}

export function AIMessage({ message }: { message: UIMessage }) {
  if (!message.parts || message.parts.length === 0) {
    return (
      <Message className="justify-start animate-slide-up">
        <MessageAvatar
          src="/avatars/ai.png"
          alt="AI"
          fallback="AI"
          className="mt-1"
        />
        <MessageContent
          markdown
          className={
            "bg-transparent p-0 transition-all duration-200 dark:prose-invert"
          }
        >
          {message.content}
        </MessageContent>
      </Message>
    );
  }

  return (
    <>
      {message.parts.map((part, index) => (
        <Message key={index} className="justify-start animate-slide-up">
          {index === 0 && (
            <MessageAvatar
              src="/avatars/ai.png"
              alt="AI"
              fallback="AI"
              className="mt-1"
            />
          )}
          {index !== 0 && <div className="w-8" />} {/* Spacing for alignment */}
          <MessageContent
            markdown={part.type === "text"}
            className={
              "bg-transparent p-0 transition-all duration-200 dark:prose-invert"
            }
          >
            {part.type === "text" ? (
              part.text
            ) : (
              <pre className="p-2 bg-muted rounded overflow-auto whitespace-pre">
                <code>{JSON.stringify(part, null, 2)}</code>
              </pre>
            )}
          </MessageContent>
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
