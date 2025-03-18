"use client";

import { useState } from "react";

import { PromptInputBasic } from "@/components/chat";
import { useTransitionRouter } from "next-view-transitions";
import { createChat } from "@/lib/actions/create-chat";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const router = useTransitionRouter();
  const isLoading = false;

  const handleSubmit = async () => {
    if (prompt.trim()) {
      const id = await createChat(prompt.trim());
      router.push(`/chat/${id}?respond`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:ml-4">
      <div className="flex flex-col items-center max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">Freestyle Chat</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Start a new conversation with Freestyle code execution.
        </p>

        <PromptInputBasic
          handleSubmit={handleSubmit}
          input={prompt}
          isLoading={isLoading}
          handleValueChange={(e) => setPrompt(e.target.value)}
          // onChange={handleInputChange}
        />

        <div className="text-muted-foreground text-sm mt-4">
          Or continue with a recent chat from the sidebar.
        </div>
      </div>
    </div>
  );
}
