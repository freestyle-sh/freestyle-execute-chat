import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  SidebarMenuItem as BaseSidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface SidebarMenuItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  tooltip?: string;
  className?: string;
}

export async function SidebarMenuItem({
  href,
  icon: Icon,
  label,
  isActive = false,
  tooltip,
  className,
}: SidebarMenuItemProps) {
  return (
    <BaseSidebarMenuItem className={className}>
      <SidebarMenuButton tooltip={tooltip || label} isActive={isActive} asChild>
        <Link href={href}>
          <Icon className="mr-2" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </BaseSidebarMenuItem>
  );
}

