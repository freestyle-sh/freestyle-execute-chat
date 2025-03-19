"use client";

import { useChat } from "@ai-sdk/react";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import {
  CommandIcon,
  CornerDownLeftIcon,
  MenuIcon,
  Square,
} from "lucide-react";
import type { ChatRequestOptions } from "ai";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Message } from "@/db/schema";
import { insertMessage } from "@/lib/actions/insert-message";
// import { useTransitionRouter } from "next-view-transitions";
import ChatMessage from "./message";
import { useRouter } from "next/navigation";
import { ChatContainer } from "./ui/chat-container";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatExists } from "@/lib/actions/check-chat";
import { useSidebarStore } from "@/lib/stores/sidebar";
import { listModules } from "@/lib/actions/list-modules";

const MobileHeader = ({ title }: { title: string }) => {
  const { toggleMobile } = useSidebarStore();

  return (
    <div className="h-12 w-full border-b items-center justify-between px-4 sticky top-0 z-10 bg-background/90 backdrop-blur-sm hidden max-md:flex">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobile}
        aria-label="Toggle Sidebar"
      >
        <MenuIcon className="h-5 w-5" />
      </Button>
      <h1 className="font-medium  truncate absolute left-1/2 -translate-x-1/2">
        {title}
      </h1>
      <div className="w-10"></div> {/* Spacer to balance the layout */}
    </div>
  );
};

export function ChatUI(props: {
  chatId: string;
  initialMessages: Message[];
  respond: boolean;
}) {
  // Define module status: enabled, disabled, or unconfigured with branding

  const router = useRouter();
  const queryClient = useQueryClient();
  const hasRunRef = useRef(false);
  const [chatTitle, setChatTitle] = useState<string>("New Chat");

  const { data: exists = true } = useQuery({
    queryKey: ["chats", props.chatId],
    queryFn: () => chatExists(props.chatId),
  });

  useEffect(() => {
    if (!exists) {
      router.replace("/");
    }
  }, [exists, router]);

  // Get chat title from the first user message, if available
  useEffect(() => {
    if (props.initialMessages.length > 0) {
      const firstUserMessage = props.initialMessages.find(
        (msg) => msg.role === "user"
      );
      if (firstUserMessage?.content) {
        // Create a title from the first ~25 chars of the first message
        const title = firstUserMessage.content.substring(0, 25);
        setChatTitle(title + (title.length >= 25 ? "..." : ""));
      }
    }
  }, [props.initialMessages]);

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
      <MobileHeader title={chatTitle} />
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
  // State to track if module tray is open
  const [isModuleTrayOpen, setIsModuleTrayOpen] = useState(false);

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => listModules(),
  });

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
      className="max-w-3xl mx-auto promptbox w-full transition-all duration-200 focus-within:shadow-none backdrop-blur-sm bg-background/90"
    >
      <div className="flex flex-col justify-between mb-2">
        <div className="flex justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            {modules.map((module, index) => (
              <div
                key={`enabled-${index.toString()}`}
                className="inline-flex items-center px-3 py-1.5 rounded-2xl border cursor-pointer transition-all text-xs active:scale-95 module-bg"
                style={
                  {
                    "--module-light": `#${module.lightModeColor}`,
                    "--module-dark": `#${module.darkModeColor}`,
                  } as React.CSSProperties
                }
              >
                <div
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                  dangerouslySetInnerHTML={{
                    __html: module.svg,
                  }}
                  className="w-4 h-4 mr-1.5 object-contain module-fill"
                  style={
                    {
                      "--module-light": `#${module.lightModeColor}`,
                      "--module-dark": `#${module.darkModeColor}`,
                    } as React.CSSProperties
                  }
                />

                <span className="capitalize module-text">{module.name}</span>
              </div>
            ))}
          </div>
          <div>
            {(modules.length ?? 0) > 0 && (
              <motion.button
                onClick={() => {
                  setIsModuleTrayOpen(!isModuleTrayOpen);
                }}
                className={cn(
                  "inline-flex items-center gap-0.5 px-3 py-1.5 cursor-pointer text-xs hover:text-foreground rounded-2xl border border-border/20 hover:bg-muted/10",
                  isModuleTrayOpen
                    ? "text-foreground bg-muted/10"
                    : "text-muted-foreground"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <span>more</span>
                <motion.svg
                  animate={{ rotate: isModuleTrayOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-3 h-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Expand</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 15l7-7 7 7"
                  />
                </motion.svg>
              </motion.button>
            )}
          </div>
        </div>

        {/* Expandable module tray */}
        <AnimatePresence>
          {isModuleTrayOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
              }}
              exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className="flex flex-col gap-1 w-full bg-background/60 backdrop-blur-sm"
            >
              <div className="h-px w-full bg-border p-0 m-0" />
              <div className="flex flex-wrap gap-1 px-0.5 m-0">
                <div className="w-full">
                  {(modules?.length ?? 0) > 0 && (
                    <div className="flex items-center">
                      <div className="text-xs font-medium text-muted-foreground">
                        Unconfigured
                      </div>
                    </div>
                  )}
                </div>

                {modules.map((module, index) => (
                  <motion.div
                    key={`unconfigured-${index.toString()}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 0.2, delay: 0.1 + index * 0.02 }}
                    className="bg-sidebar inline-flex items-center px-3 py-1.5 rounded-2xl border border-border/20 cursor-pointer transition-all text-xs active:scale-95"
                  >
                    <div
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                      dangerouslySetInnerHTML={{
                        __html: module.svg,
                      }}
                      className="w-4 h-4 mr-1.5 object-contain opacity-70 module-fill"
                      style={
                        {
                          "--module-light": `#${module.lightModeColor}`,
                          "--module-dark": `#${module.darkModeColor}`,
                        } as React.CSSProperties
                      }
                    />
                    <span className="opacity-70 capitalize module-text">
                      {module.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PromptInputTextarea
        className="rounded-2xl bg-card/50 backdrop-blur-sm"
        placeholder="Ask me to do something..."
        autoFocus
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
