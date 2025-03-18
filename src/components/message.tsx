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
  return (
    <Message className="justify-end animate-slide-in-right">
      <MessageContent className="bg-primary/10 rounded-2xl rounded-br-none shadow-sm border border-primary/10 transition-all duration-200">
        {message.content}
      </MessageContent>
    </Message>
  );
}

export function AIMessage({ message }: { message: UIMessage }) {
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

export default function ChatMessage({ message }: { message: UIMessage }) {
  switch (message.role) {
    case "user":
      return <UserMessage message={message} />;
    default:
      return <AIMessage message={message} />;
  }
}
