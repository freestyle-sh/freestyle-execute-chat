"use client";

import { useChat } from "@ai-sdk/react";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { CommandIcon, CornerDownLeftIcon, Square } from "lucide-react";
import type { ChatRequestOptions } from "ai";
import { type ChangeEvent, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "@/db/schema";
import { insertMessage } from "@/lib/actions/insert-message";
// import { useTransitionRouter } from "next-view-transitions";
import ChatMessage from "./message";
import { useRouter } from "next/navigation";
import { ChatContainer } from "./ui/chat-container";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatExists } from "@/lib/actions/check-chat";

export function ChatUI(props: {
  chatId: string;
  initialMessages: Message[];
  respond: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasRunRef = useRef(false);

  const { data: exists = true } = useQuery({
    queryKey: ["chats", props.chatId],
    queryFn: () => chatExists(props.chatId),
  });

  useEffect(() => {
    if (!exists) {
      router.replace("/");
    }
  }, [exists, router]);

  const { messages, input, handleInputChange, handleSubmit, status, reload } =
    useChat({
      initialMessages: props.initialMessages,
      fetch: async (req, init) => {
        return fetch(req, {
          ...init,
          headers: {
            ...init?.headers,
            "chat-id": props.chatId,
            "allow-first-message":
              props.initialMessages.length >= 1 ? "false" : "true",
          },
        });
      },
      onFinish: async (message) => {
        console.log("onFinish", message);

        await insertMessage(props.chatId, message);

        // Invalidate chats list to update sidebar history order
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      },
    });

  // biome-ignore lint/correctness/useExhaustiveDependencies: it's ok
  useEffect(() => {
    if (hasRunRef.current) return; // already ran
    hasRunRef.current = true;
    async function r() {
      if (props.respond && messages[messages.length - 1]?.role === "user") {
        // remove the ?respond query param
        router.push(`/chat/${props.chatId}`, {});
        await reload();
      }
    }
    r();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-svh">
      <ChatContainer
        autoScroll
        className={cn(
          "w-full flex-1 max-w-3xl mx-auto flex flex-col gap-4 pb-2 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent",
          "overflow-scroll py-4"
        )}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground animate-fade-in">
            <div className="p-4 rounded-lg text-center">
              <p className="italic mb-2">No messages yet</p>
              <p className="text-sm">Start the conversation below!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
      </ChatContainer>
      <div className="w-full pb-4">
        <PromptInputBasic
          handleSubmit={(
            event?: {
              preventDefault?: () => void;
            },
            chatRequestOptions?: ChatRequestOptions
          ) => {
            handleSubmit(event, chatRequestOptions);

            // Invalidate the chat list when user submits a message
            queryClient.invalidateQueries({ queryKey: ["chats"] });
          }}
          input={input}
          handleValueChange={handleInputChange}
          isLoading={status === "streaming" || status === "submitted"}
        />
      </div>
    </div>
  );
}

export function PromptInputBasic(props: {
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  input: string;
  isLoading: boolean;
  handleValueChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
}) {
  // const handleValueChange = (value: string) => {
  //   setInput(value);
  // };

  return (
    <PromptInput
      value={props.input}
      onValueChange={(value) =>
        props.handleValueChange({
          target: { value },
        } as ChangeEvent<HTMLTextAreaElement>)
      }
      onSubmit={props.handleSubmit}
      isLoading={props.isLoading}
      className="max-w-3xl mx-auto promptbox w-full transition-all duration-200 focus-within:shadow-md backdrop-blur-sm bg-background/90"
    >
      <PromptInputTextarea
        className="rounded-2xl bg-card/50 backdrop-blur-sm"
        placeholder="Ask me to do something..."
      />
      <PromptInputActions className="justify-end pt-2">
        <PromptInputAction
          tooltip={props.isLoading ? "Stop generation" : "Send message"}
        >
          <Button
            variant="default"
            size="default"
            className={cn(
              props.isLoading ? "w-8" : "w-14",
              "h-8 px-3 rounded-full cursor-pointer transition-all duration-300 ease-out hover:bg-primary/90"
            )}
            onClick={props.handleSubmit}
          >
            {props.isLoading ? (
              <Square className="fill-secondary" />
            ) : (
              <span className="flex flex-row gap-0.5 items-center transition-all">
                <CommandIcon className="size-4" />
                <CornerDownLeftIcon className="size-4" />
              </span>
            )}
          </Button>
        </PromptInputAction>
      </PromptInputActions>
    </PromptInput>
  );
}
