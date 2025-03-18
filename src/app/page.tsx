"use client";

import { useState } from "react";

import { PromptInputBasic } from "@/components/chat";
import { useTransitionRouter } from "next-view-transitions";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const router = useTransitionRouter();

  const handleSubmit = () => {
    // e.preventDefault ?? e.preventDefault();
    if (prompt.trim()) {
      // In a real app, you'd create a new chat and redirect to it
      router.push(`/chat/new?prompt=${encodeURIComponent(prompt)}`);
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
          handleValueChange={(e) => setPrompt(e.target.value)}
          // onChange={handleInputChange}
        />
        {/* <Card className="w-full mb-4 p-4 shadow-sm border-[0.5px]">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Ask me anything..."
              className="min-h-24 resize-none text-base p-2 border-none focus-visible:ring-0 shadow-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="default"
                className="cursor-pointer"
                disabled={!prompt.trim()}
              >
                <SendIcon className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
          </form>
        </Card> */}

        <div className="text-muted-foreground text-sm mt-4">
          Or continue with a recent chat from the sidebar.
        </div>
      </div>
    </div>
  );
}
