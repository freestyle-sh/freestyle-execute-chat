"use client";

import { useState } from "react";

import { PromptInputBasic } from "@/components/chat";
import { useTransitionRouter } from "next-view-transitions";
import { createChat } from "@/actions/chats/create-chat";
import { useQueryClient } from "@tanstack/react-query";
import { useModulesStore } from "@/stores/modules";
import { useUser } from "@stackframe/stack";
import { useQuery } from "@tanstack/react-query";
import { listModules } from "@/actions/modules/list-modules";
import { ExamplePrompt } from "@/components/ui/example-prompt";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader } from "@/components/mobile-header";

export default function Home() {
  const user = useUser({ or: "anonymous" });
  const [prompt, setPrompt] = useState("");
  const queryClient = useQueryClient();
  const router = useTransitionRouter();
  const isLoading = false;
  const [submitting, setSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const selectedModules = useModulesStore((state) => state.selectedModules);

  const { data: modules } = useQuery({
    queryKey: ["modules", { user: user?.id }],
    queryFn: () => listModules(),
  });

  const handleSubmit = async () => {
    if (prompt.trim()) {
      setSubmitting(true);
      try {
        const id = await createChat(prompt.trim(), selectedModules);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        router.push(`/chat/${id}?respond`);
      } catch (error) {
        console.error("Error creating chat:", error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-svh">
      <MobileHeader title="Freestyle Chat" />
      <div className="flex flex-col items-center justify-center h-full p-4 md:ml-4 animate-fade-in">
        <div className="flex flex-col items-center max-w-3xl w-full rounded-2xl animate-slide-up">
        <h1 className="text-3xl font-bold mb-6">Freestyle Chat</h1>
        <span className="text-muted-foreground mb-4 text-center max-w-md">
          Start a new conversation with Freestyle code execution.
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 w-full max-w-3xl">
          <ExamplePrompt
            title="GitHub Activity Summary"
            description="Create a Google Sheet with a Summary of your GitHub activity"
            promptText="Get my recent commits, pull requests, and issues from GitHub and create a Google Sheet with a table with all of them, and charts about what repos they are in, and what languages they are written in."
            moduleNames={["github", "Google Sheets"]}
            modules={modules}
            onSelectAction={setPrompt}
          />

          <ExamplePrompt
            title="Search web for AI frameworks with Exa"
            description="Find the latest information about AI tools and libraries"
            promptText="Help me search the web for information about AI frameworks using Exa"
            moduleNames={["exa"]}
            modules={modules}
            onSelectAction={setPrompt}
          />

          {!isMobile && (
            <>
              <ExamplePrompt
                title="Cancel my meetings today"
                description="Cancel all my Google Calendar events for today and email all of the attendees to let them know"
                promptText="Get a list of my GitHub repositories and create a Google Sheet with their names, descriptions, stars, and last updated dates"
                moduleNames={["Google Calendar", "Gmail"]}
                modules={modules}
                onSelectAction={setPrompt}
              />

              <ExamplePrompt
                title="Stripe revenue report via email"
                description="Generate a Stripe revenue summary and send it via Resend"
                promptText="Create a summary of my Stripe revenue for the past week and send it to me via email using Resend. Include total revenue, new customers, and popular products."
                moduleNames={["stripe", "resend"]}
                modules={modules}
                onSelectAction={setPrompt}
              />
            </>
          )}
        </div>

        <PromptInputBasic
          handleSubmitAction={handleSubmit}
          input={prompt}
          isLoading={submitting || isLoading}
          handleValueChangeAction={(e) => setPrompt(e.target.value)}
          user={user}
          showModuleAuthPopupAction={() => {
            router.push("/handler/signup");
          }}
        />

        <div className="text-muted-foreground text-center text-sm mt-6 flex items-center gap-2 before:content-[''] before:h-[1px] before:w-12 before:bg-border after:content-[''] after:h-[1px] after:w-12 after:bg-border">
          Or continue with a recent chat from the sidebar.
        </div>
      </div>
      </div>
    </div>
  );
}