"use client";

import { useUser } from "@stackframe/stack";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  const user = useUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6 gradient-text">Settings</h1>
          <div className="flex flex-col items-center p-8 rounded-lg border bg-card">
            <p className="text-lg mb-6">
              You need to log in to configure Freestyle Chat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link
                href="/handler/signin"
                className="flex-1 w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md"
              >
                Log in
              </Link>
              <Link
                href="/"
                className="flex-1 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-2 px-4 rounded-md"
              >
                Return to Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to the modules tab by default
  redirect("/settings/modules");
}

