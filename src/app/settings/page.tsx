"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { SettingsSection, SettingsItem } from "@/components/settings";
import { ModulesSettings } from "@/components/modules-settings";
import { useSearchParams } from "next/navigation";
import { AccountSettings, useUser } from "@stackframe/stack";
import Link from "next/link";
import { createContext, Suspense, useContext, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaintbrushIcon, PlugIcon, UserIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const SettingsContext = createContext(
  {} as {
    direction: number;
    selectedTab: string;
  },
);

function SettingsTab({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) {
  const { direction, selectedTab } = useContext(SettingsContext);

  return (
    <TabsContent value={value}>
      <AnimatePresence mode="wait" custom={direction}>
        {selectedTab === value ? (
          <motion.div
            key={value}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </TabsContent>
  );
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const moduleToOpen = searchParams.get("module");
  const defaultTab = searchParams.get("tab") || "modules";
  const user = useUser();

  const [selectedTab, setSelectedTab] = useState(defaultTab);
  const [direction, setDirection] = useState(0); // 0 = initial, 1 = right-to-left, -1 = left-to-right

  const handleTabChange = (value: string) => {
    const tabs = ["modules", "account", "appearance"];
    const currentIndex = tabs.indexOf(selectedTab);
    const newIndex = tabs.indexOf(value);

    // Handle case where tab isn't in the list
    if (currentIndex === -1 || newIndex === -1) {
      setDirection(0);
    } else {
      setDirection(newIndex > currentIndex ? 1 : -1);
    }

    setSelectedTab(value);
  };

  return (
    <>
      {user ? (
        <div className="p-6 animate-fade-in">
          <h1 className="text-2xl font-bold mb-6 gradient-text">Settings</h1>
          {
            <div className="max-w-3xl animate-slide-up">
              <SettingsContext.Provider value={{ direction, selectedTab }}>
                <Tabs
                  value={selectedTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="bg-transparent mb-4">
                    <TabsTrigger
                      value="modules"
                      className="data-[state=active]:bg-muted cursor-pointer"
                    >
                      <PlugIcon className="mr-2" size={16} />
                      Modules
                    </TabsTrigger>
                    <TabsTrigger
                      className="data-[state=active]:bg-muted cursor-pointer"
                      value="account"
                    >
                      <UserIcon className="mr-2" size={16} />
                      Account
                    </TabsTrigger>
                    <TabsTrigger
                      className="data-[state=active]:bg-muted cursor-pointer"
                      value="appearance"
                    >
                      <PaintbrushIcon className="mr-2" size={16} />
                      Appearance
                    </TabsTrigger>
                  </TabsList>
                  <SettingsTab value="appearance">
                    <SettingsSection
                      title="Appearance"
                      description="Customize the look and feel of Freestyle Chat"
                    >
                      <SettingsItem
                        title="Theme"
                        description="Choose your preferred theme mode"
                      >
                        <ThemeToggle />
                      </SettingsItem>
                    </SettingsSection>
                  </SettingsTab>
                  <SettingsTab value="account">
                    <SettingsSection
                      title="Account"
                      description="Manage your account settings"
                    >
                      <Suspense>
                        <AccountSettings />
                      </Suspense>
                    </SettingsSection>
                  </SettingsTab>
                  <SettingsTab value="modules">
                    <ModulesSettings moduleToOpen={moduleToOpen} />
                  </SettingsTab>
                </Tabs>
              </SettingsContext.Provider>
            </div>
          }
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-fade-in">
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
      )}
    </>
  );
}
