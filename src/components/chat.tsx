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
import { ChatRequestOptions } from "ai";
import { ChangeEvent, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "@/db/schema";
import { insertMessage } from "@/lib/actions/insert-message";
import { useTransitionRouter } from "next-view-transitions";

export function ChatUI(props: {
  chatId: string;
  initialMessages: Message[];
  respond: boolean;
}) {
  const router = useTransitionRouter();
  const { messages, input, handleInputChange, handleSubmit, status, reload } =
    useChat({
      initialMessages: props.initialMessages,
      fetch: async (req, init) => {
        return fetch(req, {
          ...init,
          headers: {
            ...init?.headers,
            "chat-id": props.chatId,
          },
        });
      },
      onFinish: async (message) => {
        console.log("onFinish", message);

        await insertMessage(props.chatId, message);
      },
    });

  useEffect(() => {
    async function r() {
      if (props.respond && messages[messages.length - 1]?.role === "user") {
        // remove the ?respond query param
        router.replace(`/chat/${props.chatId}`, {
          scroll: false,
        });

        await reload();
      }
    }
    r();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full justify-between max-w-3xl mx-auto p-6 w-full">
      <div className="flex flex-col gap-4 overflow-y-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      <div className="mt-auto pt-4">
        <PromptInputBasic
          handleSubmit={handleSubmit}
          input={input}
          handleValueChange={handleInputChange}
          isLoading={status === "streaming"}

          // onChange={handleInputChange}
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
      className="promptbox w-full max-w-(--breakpoint-md)"
    >
      <PromptInputTextarea
        className="rounded-2xl"
        placeholder="Ask me anything..."
      />
      <PromptInputActions className="justify-end pt-2">
        <PromptInputAction
          tooltip="Send message"
          // tooltip={isLoading ? "Stop generation" : "Send message"}
        >
          <Button
            variant="default"
            size="default"
            className={cn(
              props.isLoading ? "w-8" : "w-14",
              "h-8 px-3 rounded-full cursor-pointer transition-all duration-300 ease-out"
            )}
            onClick={props.handleSubmit}
          >
            {props.isLoading ? (
              <Square className="fill-secondary" />
            ) : (
              <span className="flex flex-row gap-0.5 items-center">
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
