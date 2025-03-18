"use client";

import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface SidebarToggleButtonProps {
  className?: string;
}

export function SidebarToggleButton({ className }: SidebarToggleButtonProps) {
  return (
    <SidebarMenuItem className={className || "w-min"}>
      <SidebarMenuButton asChild>
        <SidebarTrigger className="cursor-pointer" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}