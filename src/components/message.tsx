"use client";

import type { Components } from "react-markdown";
import { Message, MessageContent, MessageAvatar } from "./ui/message";
import type { UIMessage } from "ai";
import { cn } from "@/lib/utils";

const markdownComponents: Partial<Components> = {
  h1: ({ children }) => <h1 className="text-2xl font-bold mb-2">{children}</h1>,
};

export function UserMessage({ message }: { message: UIMessage }) {
  return (
    <Message className="justify-end">
      <MessageContent>{message.content}</MessageContent>
    </Message>
  );
}

export function AIMessage({ message }: { message: UIMessage }) {
  return (
    <Message className="justify-start">
      <MessageAvatar src="/avatars/ai.png" alt="AI" fallback="AI" />
      <MessageContent
        markdown
        className={"bg-transparent p-0 dark:prose-invert"}
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
