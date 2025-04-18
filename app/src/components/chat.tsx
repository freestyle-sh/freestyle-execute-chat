// Existing imports...
"use client";

import { useChat } from "@ai-sdk/react";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-input";
import { Button } from "@/components/ui/button";
import {
  CommandIcon,
  CornerDownLeftIcon,
  Square,
} from "lucide-react";
import type { ChatRequestOptions } from "ai";
import {
  type ChangeEvent,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Message } from "@/db/schema";
import { insertMessage } from "@/actions/chats/insert-message";
import ChatMessage from "./message";
import { useRouter } from "next/navigation";
import { ChatContainer } from "./chat-container";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getChatInfo } from "@/actions/chats/check-chat";
import { useSidebarStore } from "@/stores/sidebar";
import { useModulesStore } from "@/stores/modules";
import {
  listModules,
  type ModuleWithRequirements,
} from "@/actions/modules/list-modules";
import { capitalize } from "@/lib/typography";
import { Skeleton } from "./ui/skeleton";
import { toggleChatModule } from "@/actions/modules/toggle-chat-module";
import { AuthPopup } from "@/components/ui/auth-popup";
import { useUser } from "@stackframe/stack";
import { configureModules } from "@/components/utility/dialogs/store";
import { toast } from "sonner";
import { MobileHeader } from "./mobile-header";

export type CurrentChatContext = {
  chatId: string;
  addToolResult: ({
    toolCallId,
    result,
  }: {
    toolCallId: string;
    result: unknown;
  }) => void;
};

export const CurrentChatContext = createContext<CurrentChatContext | undefined>(
  undefined,
);

export function useCurrentChat() {
  const context = useContext(CurrentChatContext);

  if (context === undefined) {
    throw new Error("useCurrentChat must be used within a CurrentChatProvider");
  }

  return context;
}

export function ChatUI({
  chatId,
  initialMessages,
  respond,
}: {
  chatId: string;
  initialMessages: Message[];
  respond: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasRunRef = useRef(false);

  const user = useUser({ or: "return-null" });

  const { data: chat } = useQuery({
    queryKey: ["chats", chatId],
    queryFn: () =>
      getChatInfo(chatId).then((chat) => {
        if (chat === undefined) {
          router.replace("/");
        }
        return chat ?? null;
      }),
  });

  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);
  const [isModuleAuthPopup, setIsModuleAuthPopup] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    reload,
    addToolResult,
  } = useChat({
    id: chatId,
    initialMessages,
    onError: (error) => {
      const errorJson = JSON.parse(error.message as unknown as string);
      if (errorJson?.error?.kind === "AnonymousUserMessageLimit") {
        // Show our custom auth popup
        setIsAuthPopupOpen(true);
        setIsModuleAuthPopup(false);
      }
    },
    fetch: async (req, init) => {
      return fetch(req, {
        ...init,
        headers: {
          ...init?.headers,
          "chat-id": chatId,
          "allow-first-message": initialMessages.length >= 1 ? "false" : "true",
        },
      });
    },
    onFinish: async (message) => {
      await insertMessage(chatId, message);

      // Invalidate chats list to update sidebar history order
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  useEffect(() => {
    if (hasRunRef.current) return; // already ran
    hasRunRef.current = true;
    if (respond && messages[messages.length - 1]?.role === "user") {
      // remove the ?respond query param
      router.push(`/chat/${chatId}`, {});
      reload();
    }
  }, [router, respond, chatId, reload, messages]);

  const showModuleAuthPopup = () => {
    setIsAuthPopupOpen(true);
    setIsModuleAuthPopup(true);
  };

  return (
    <CurrentChatContext.Provider value={{ chatId, addToolResult }}>
      <div className="flex flex-col h-svh">
        <MobileHeader title={chat?.name ?? "Untitled"} />
        <ChatContainer
          autoScroll
          className={cn(
            "w-full flex-1 max-w-3xl mx-auto flex flex-col gap-4 pb-2",
            "overflow-scroll py-4 scrollbar-none",
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
              <ChatMessage key={message.id} message={message} chatId={chatId} />
            ))
          )}
        </ChatContainer>
        <div className="w-full pb-4">
          <PromptInputBasic
            handleSubmitAction={(
              event?: {
                preventDefault?: () => void;
              },
              chatRequestOptions?: ChatRequestOptions,
            ) => {
              handleSubmit(event, chatRequestOptions);

              // Invalidate the chat list when user submits a message
              queryClient.invalidateQueries({ queryKey: ["chats"] });
            }}
            input={input}
            handleValueChangeAction={handleInputChange}
            isLoading={status === "streaming" || status === "submitted"}
            chatId={chatId}
            user={user}
            showModuleAuthPopupAction={showModuleAuthPopup}
          />
        </div>

        {/* Auth popup - could be for either message limit or module configuration */}
        <AuthPopup
          isOpen={isAuthPopupOpen}
          onClose={() => setIsAuthPopupOpen(false)}
          message={
            isModuleAuthPopup
              ? "In order to configure modules, you need to sign in"
              : "Please sign in to send more messages"
          }
          ctaText="Create Account"
          title="Sign In to Continue"
          allowClose={true} // Always allow close for both types
          onAction={() => {
            // Navigate to sign in page or trigger sign in flow
            router.push("/handler/signup");
          }}
        />
      </div>
    </CurrentChatContext.Provider>
  );
}

export function PromptInputBasic({
  input,
  isLoading,
  chatId,
  handleSubmitAction: handleSubmit,
  handleValueChangeAction: handleValueChange,
  user,
  showModuleAuthPopupAction,
}: {
  input: string;
  isLoading: boolean;
  chatId?: string; // Make chatId optional for homepage usage
  handleValueChangeAction: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  handleSubmitAction: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  user: unknown;
  showModuleAuthPopupAction: () => void;
}) {
  // State to track if module tray is open
  const [isModuleTrayOpen, setIsModuleTrayOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Use in-memory module store when no chatId is provided (homepage)
  const { selectedModules, toggleModule } = useModulesStore();

  // Fetch modules for both scenarios - only difference is chatId for enabled status
  const { data: modules = [], isLoading: isLoadingModules } = useQuery({
    queryKey: ["modules", chatId || "homepage"],
    queryFn: () => listModules(chatId),
  });

  const toggleModuleMutation = useMutation({
    mutationFn: async ({
      moduleId,
      enabled,
    }: {
      moduleId: string;
      enabled: boolean;
    }) => {
      if (!chatId) {
        return;
      }

      const status = await toggleChatModule({
        chatId,
        moduleId,
        enabled,
      });

      return status;
    },
    onMutate: async ({ moduleId, enabled }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["modules", chatId] });

      // Snapshot the previous value
      const previousModules = queryClient.getQueryData(["modules", chatId]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["modules", chatId],
        (old: ModuleWithRequirements[] | undefined) => {
          if (!old) return [];
          return old.map((module) => {
            if (module.id === moduleId) {
              return { ...module, isEnabled: enabled };
            }
            return module;
          });
        },
      );

      return { previousModules };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousModules) {
        queryClient.setQueryData(["modules", chatId], context.previousModules);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to make sure the server state
      // is reflected in the UI
      queryClient.invalidateQueries({ queryKey: ["modules", chatId] });
    },
  });

  const handleToggleModule = async (
    moduleId: string,
    currentEnabled?: boolean,
  ) => {
    // Find the module to check if it's configured
    const foundModule = modules.find((m) => m.id === moduleId);

    if (foundModule && !foundModule.isConfigured) {
      // If module isn't configured, show module configuration dialog
      if (user) {
        // Open configuration dialog with confirmation
        const modulesToConfigure = [foundModule];

        try {
          const confirmed = await configureModules(modulesToConfigure);
          if (confirmed) {
            // Module was configured, now enable it
            const newEnabledState = true;

            if (chatId) {
              // Use the mutation for persisted chats
              toggleModuleMutation.mutate({
                moduleId,
                enabled: newEnabledState,
              });
            } else {
              // Use the zustand store for homepage (non-persisted) chat
              toggleModule(moduleId, newEnabledState);
            }

            // Show success toast
            toast.success(
              `${capitalize(foundModule.name)} configured and enabled`,
            );
          }
        } catch (error) {
          console.error("Error configuring module:", error);
        }
      } else {
        // If not logged in, show auth popup
        showModuleAuthPopupAction();
      }
      return;
    }

    // Toggle the current state (default to false if undefined)
    const newEnabledState = !(currentEnabled ?? false);

    if (chatId) {
      // Use the mutation for persisted chats
      toggleModuleMutation.mutate({ moduleId, enabled: newEnabledState });
    } else {
      // Use the zustand store for homepage (non-persisted) chat
      toggleModule(moduleId, newEnabledState);
    }
  };

  return (
    <PromptInput
      value={input}
      onValueChange={(value) =>
        handleValueChange({
          target: { value },
        } as ChangeEvent<HTMLTextAreaElement>)
      }
      onSubmit={handleSubmit}
      isLoading={isLoading}
      className="max-w-3xl mx-auto promptbox w-full transition-all duration-200 focus-within:shadow-none backdrop-blur-sm bg-background/90"
    >
      <div className="flex flex-col justify-between mb-2">
        <div className="flex justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            {isLoadingModules ? (
              <>
                <div className="inline-flex items-center px-2 py-1.5 rounded-2xl border transition-all text-xs opacity-70 bg-muted/30">
                  <Skeleton className="w-4 h-4 mr-1.5 rounded-sm" />
                  <Skeleton className="w-16 h-3.5" />
                </div>
                <div className="inline-flex items-center px-2 py-1.5 rounded-2xl border transition-all text-xs opacity-70 bg-muted/30">
                  <Skeleton className="w-4 h-4 mr-1.5 rounded-sm" />
                  <Skeleton className="w-20 h-3.5" />
                </div>
                <div className="inline-flex items-center px-2 py-1.5 rounded-2xl border transition-all text-xs opacity-70 bg-muted/30">
                  <Skeleton className="w-4 h-4 mr-1.5 rounded-sm" />
                  <Skeleton className="w-14 h-3.5" />
                </div>
              </>
            ) : chatId ? (
              modules.filter((module) => module.isConfigured).length === 0 ? (
                <div className="text-xs text-muted-foreground px-1">
                  No modules configured.
                </div>
              ) : (
                modules
                  .filter((module) => module.isConfigured)
                  .map((module, index) => (
                    <button
                      type="button"
                      key={`enabled-${index.toString()}`}
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-2xl border cursor-pointer transition-all text-xs active:scale-95",
                        module.isEnabled === false
                          ? "opacity-50 bg-muted/30"
                          : "module-bg",
                      )}
                      style={
                        {
                          "--module-light": `#${module.lightModeColor}`,
                          "--module-dark": `#${module.darkModeColor}`,
                        } as React.CSSProperties
                      }
                      onClick={() =>
                        handleToggleModule(module.id, module.isEnabled)
                      }
                    >
                      <div
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                        dangerouslySetInnerHTML={{
                          __html: module.svg,
                        }}
                        className={cn(
                          "w-4 h-4 mr-1.5 object-contain",
                          module.isEnabled === false
                            ? "opacity-50 dark:fill-gray-400"
                            : "module-fill",
                        )}
                        style={
                          {
                            "--module-light": `#${module.lightModeColor}`,
                            "--module-dark": `#${module.darkModeColor}`,
                          } as React.CSSProperties
                        }
                      />

                      <span className={module.isEnabled ? "text-module" : ""}>
                        {capitalize(module.name)}
                      </span>
                    </button>
                  ))
              )
            ) : // Show modules from store for homepage (non-persisted) chat
            modules.filter((module) => module.isConfigured).length === 0 ? (
              <div className="text-xs text-muted-foreground px-1">
                No modules configured.
              </div>
            ) : (
              modules
                .filter((module) => module.isConfigured)
                .map((module, index) => {
                  // Check if this module exists in the store
                  const moduleState = selectedModules[module.id];
                  const isEnabled = moduleState?.enabled;

                  return (
                    <button
                      type="button"
                      key={`homepage-${index.toString()}`}
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-2xl border cursor-pointer transition-all text-xs active:scale-95",
                        isEnabled === false || isEnabled === undefined
                          ? "opacity-50 bg-muted/30 dark:fill-gray-300"
                          : "module-bg",
                      )}
                      style={
                        {
                          "--module-light": `#${module.lightModeColor}`,
                          "--module-dark": `#${module.darkModeColor}`,
                        } as React.CSSProperties
                      }
                      onClick={() => handleToggleModule(module.id, isEnabled)}
                    >
                      <div
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                        dangerouslySetInnerHTML={{
                          __html: module.svg,
                        }}
                        className={cn(
                          "w-4 h-4 mr-1.5 object-contain",
                          isEnabled === false || isEnabled === undefined
                            ? "opacity-50"
                            : "module-fill",
                        )}
                        style={
                          {
                            "--module-light": `#${module.lightModeColor}`,
                            "--module-dark": `#${module.darkModeColor}`,
                          } as React.CSSProperties
                        }
                      />

                      <span
                        className={
                          isEnabled === false || isEnabled === undefined
                            ? ""
                            : "text-module"
                        }
                      >
                        {capitalize(module.name)}
                      </span>
                    </button>
                  );
                })
            )}
          </div>
          <div>
            {isLoadingModules ? (
              // Skeleton for "more" button with exact same styles
              <div className="inline-flex items-center gap-0.5 px-3 py-1.5 rounded-2xl border border-border/20 opacity-70">
                <Skeleton className="w-10 h-3.5" />
              </div>
            ) : (
              modules.filter((module) => !module.isConfigured).length > 0 && (
                <motion.button
                  onClick={() => {
                    setIsModuleTrayOpen(!isModuleTrayOpen);
                  }}
                  className={cn(
                    "inline-flex items-center gap-0.5 px-3 py-1.5 cursor-pointer text-xs hover:text-foreground rounded-2xl border border-border/20 hover:bg-muted/10",
                    isModuleTrayOpen
                      ? "text-foreground bg-muted/10"
                      : "text-muted-foreground",
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
              )
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
              <div className="flex flex-wrap gap-1 m-0">
                <div className="w-full">
                  {modules.filter((module) => !module.isConfigured).length >
                    0 && (
                    <div className="flex items-center">
                      <div className="text-xs font-medium text-muted-foreground">
                        Unconfigured
                      </div>
                    </div>
                  )}
                </div>

                {modules
                  .filter((module) => !module.isConfigured)
                  .map((module, index) => (
                    <motion.div
                      key={`unconfigured-${index.toString()}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      transition={{ duration: 0.2, delay: 0.1 + index * 0.02 }}
                      className="bg-sidebar inline-flex items-center px-3 py-1.5 rounded-2xl border border-border/20 cursor-pointer hover:bg-muted/20 transition-all text-xs"
                      onClick={() => handleToggleModule(module.id, false)}
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
                      <span className="opacity-70">
                        {capitalize(module.name)}
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
          tooltip={isLoading ? "Stop generation" : "Send message"}
        >
          <Button
            variant="default"
            size="default"
            className={cn(
              isLoading ? "w-8" : "w-14",
              "h-8 px-3 rounded-full cursor-pointer transition-all duration-300 ease-out hover:bg-primary/90",
            )}
            onClick={handleSubmit}
          >
            {isLoading ? (
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
