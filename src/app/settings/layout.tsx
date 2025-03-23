"use client";

import { useUser } from "@stackframe/stack";
import { usePathname, useRouter } from "next/navigation";
import { PaintbrushIcon, PlugIcon, UserIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

const tabs = [
  {
    name: "Modules",
    icon: <PlugIcon className="mr-2" size={16} />,
    href: "/settings/modules",
    value: "modules",
    index: 0,
  },
  {
    name: "Account",
    icon: <UserIcon className="mr-2" size={16} />,
    href: "/settings/account",
    value: "account",
    index: 1,
  },
  {
    name: "Appearance",
    icon: <PaintbrushIcon className="mr-2" size={16} />,
    href: "/settings/appearance",
    value: "appearance",
    index: 2,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const prevPathRef = useRef(pathname);

  const currentTab =
    tabs.find((tab) => pathname.startsWith(tab.href)) || tabs[0];

  let xOffset = 0;

  // We find the previous tab by matching previous pathname
  const prevTab = tabs.find((tab) => prevPathRef.current.startsWith(tab.href));

  if (prevTab && currentTab.index !== prevTab.index) {
    // If we're moving right (increasing index), slide from right
    // If we're moving left (decreasing index), slide from left
    xOffset = currentTab.index > prevTab.index ? 80 : -80;
  }

  // Update the ref after figuring out direction
  useEffect(() => {
    prevPathRef.current = pathname;
  }, [pathname]);

  const handleTabChange = (value: string) => {
    const tab = tabs.find((t) => t.value === value);
    if (tab) {
      router.push(tab.href);
    }
  };

  if (!user) {
    return children;
  }

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6 gradient-text">Settings</h1>
      <div className="max-w-3xl animate-slide-up">
        <div className="w-full">
          <Tabs value={currentTab.value} onValueChange={handleTabChange}>
            <TabsList className="bg-transparent mb-4">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-muted cursor-pointer"
                >
                  <span className="flex items-center">
                    {tab.icon}
                    {tab.name}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="mt-4">
            <motion.div
              key={currentTab.value}
              initial={{ x: xOffset }}
              animate={{ x: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="w-full"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

