import Link from "next/link";
import { MessageSquarePlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 md:ml-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Freestyle Chat</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Start a new conversation or continue with a recent chat from the
        sidebar.
      </p>
      <Button asChild>
        <Link href="/chat/new">
          <MessageSquarePlusIcon className="mr-2 h-5 w-5" />
          New Chat
        </Link>
      </Button>
    </div>
  );
}
