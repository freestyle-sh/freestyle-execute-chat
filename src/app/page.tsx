"use client";

import { useState } from "react";

import { PromptInputBasic } from "@/components/chat";
import { useTransitionRouter } from "next-view-transitions";
import { createChat } from "@/actions/chats/create-chat";
import { useQueryClient } from "@tanstack/react-query";
import { useModulesStore } from "@/stores/modules";
import { useUser } from "@stackframe/stack";

export default function Home() {
  const user = useUser({ or: "anonymous" });
  const [prompt, setPrompt] = useState("");
  const queryClient = useQueryClient();
  const router = useTransitionRouter();
  const isLoading = false;
  const selectedModules = useModulesStore((state) => state.selectedModules);

  const handleSubmit = async () => {
    if (prompt.trim()) {
      const id = await createChat(prompt.trim(), selectedModules);

      queryClient.invalidateQueries({ queryKey: ["chats"] });

      router.push(`/chat/${id}?respond`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:ml-4 animate-fade-in">
      <div className="flex flex-col items-center max-w-2xl w-full rounded-2xl animate-slide-up">
        <h1 className="text-3xl font-bold mb-6">Freestyle Chat</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Start a new conversation with Freestyle code execution.
        </p>

        <PromptInputBasic
          handleSubmitAction={handleSubmit}
          input={prompt}
          isLoading={isLoading}
          handleValueChangeAction={(e) => setPrompt(e.target.value)}
        />

        <div className="text-muted-foreground text-center text-sm mt-6 flex items-center gap-2 before:content-[''] before:h-[1px] before:w-12 before:bg-border after:content-[''] after:h-[1px] after:w-12 after:bg-border">
          Or continue with a recent chat from the sidebar.
        </div>
      </div>
    </div>
  );
}
