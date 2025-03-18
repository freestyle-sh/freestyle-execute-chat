"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SidebarHeader as BaseSidebarHeader } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  children: ReactNode;
  isOpen?: boolean;
  className?: string;
}

export function SidebarHeader({
  children,
  isOpen = true,
  className,
}: SidebarHeaderProps) {
  return (
    <BaseSidebarHeader className={className}>
      <div
        className={cn(
          "flex items-center ml-1 py-0.5",
          isOpen ? "justify-between" : "justify-start",
        )}
      >
        <h2 className="text-lg font-semibold overflow-hidden">
          {children}
        </h2>
      </div>
    </BaseSidebarHeader>
  );
}