"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { SettingsSection, SettingsItem } from "@/components/settings";
import { ModulesSettings } from "@/components/modules-settings";
import { useSearchParams } from "next/navigation";
import { useUser } from "@stackframe/stack";
import Link from "next/link";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const moduleToOpen = searchParams.get("module");
  const user = useUser();

  return (
    <>
      {user ? (
        <div className="p-6 animate-fade-in">
          <h1 className="text-2xl font-bold mb-6 gradient-text">Settings</h1>
          <div className="space-y-6 max-w-3xl animate-slide-up">
            <SettingsSection title="Appearance">
              <SettingsItem
                title="Theme"
                description="Choose your preferred theme mode"
              >
                <ThemeToggle />
              </SettingsItem>
            </SettingsSection>

            <ModulesSettings moduleToOpen={moduleToOpen} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-fade-in">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-6 gradient-text">Settings</h1>
            <div className="flex flex-col items-center p-8 rounded-lg border bg-card">
              <p className="text-lg mb-6">
                You need to log in to configure modules
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <a href="/handler/signin" className="flex-1">
                  <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md">
                    Log in
                  </button>
                </a>
                <Link href="/" className="flex-1">
                  <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-2 px-4 rounded-md">
                    Return to Chat
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
