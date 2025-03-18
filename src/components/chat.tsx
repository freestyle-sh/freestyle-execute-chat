"use client";

import { useChat } from "@ai-sdk/react";

export function ChatUI() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({});

  return (
    <div className="flex flex-col h-full justify-between max-w-3xl mx-auto p-6 w-full">
      <div className="flex flex-col gap-4 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="p-3 rounded-lg">
            {message.role === "user" ? "User: " : "AI: "}
            {message.content}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4">
        <PromptInputBasic
          handleSubmit={handleSubmit}
          input={input}
          handleValueChange={handleInputChange}
          // onChange={handleInputChange}
        />
      </div>
    </div>
  );
}

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
// import { useState } from "react";
import { ChatRequestOptions } from "ai";
import { ChangeEvent } from "react";

export function PromptInputBasic(props: {
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  input: string;
  handleValueChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
}) {
  // const [input, setInput] = useState("");
  // // const [isLoading, setIsLoading] = useState(false);

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
      // isLoading={isLoading}
      onSubmit={props.handleSubmit}
      className="promptbox w-full max-w-(--breakpoint-md)"
    >
      <PromptInputTextarea placeholder="Ask me anything..." />
      <PromptInputActions className="justify-end pt-2">
        <PromptInputAction
          tooltip="Send message"
          // tooltip={isLoading ? "Stop generation" : "Send message"}
        >
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={props.handleSubmit}
          >
            {/* {isLoading ? (
              <Square className="size-5 fill-current" />
            ) : ( */}
            <ArrowUp className="size-5" />
            {/* )} */}
          </Button>
        </PromptInputAction>
      </PromptInputActions>
    </PromptInput>
  );
}
