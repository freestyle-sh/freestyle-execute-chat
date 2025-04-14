"use client";

import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { useSidebarStore } from "@/stores/sidebar";

export const MobileHeader = ({ title }: { title: string }) => {
  const { toggleMobile } = useSidebarStore();

  return (
    <div className="h-12 w-full border-b items-center justify-between px-4 sticky top-0 z-10 bg-background/90 backdrop-blur-sm hidden max-md:flex">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobile}
        aria-label="Toggle Sidebar"
      >
        <MenuIcon className="h-5 w-5" />
      </Button>
      <h1 className="font-medium truncate absolute left-1/2 -translate-x-1/2">
        {title}
      </h1>
      <div className="w-10" />
    </div>
  );
};