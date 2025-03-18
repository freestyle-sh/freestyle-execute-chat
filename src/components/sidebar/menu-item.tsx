import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  SidebarMenuItem as BaseSidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface SidebarMenuItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  tooltip?: string;
  className?: string;
}

export async function SidebarMenuButtonItem({
  icon: Icon,
  onClick,
  label,
  isActive = false,
  tooltip,
  className,
}: SidebarMenuItemProps & {
  onClick?: () => void;
}) {
  return (
    <BaseSidebarMenuItem className={className}>
      <SidebarMenuButton
        onClick={onClick}
        tooltip={tooltip || label}
        isActive={isActive}
        className="flex gap-2"
      >
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
    </BaseSidebarMenuItem>
  );
}

export async function SidebarMenuLinkItem({
  href,
  icon: Icon,
  label,
  isActive = false,
  tooltip,
  className,
}: SidebarMenuItemProps & {
  href: string;
}) {
  return (
    <BaseSidebarMenuItem className={className}>
      <SidebarMenuButton tooltip={tooltip || label} isActive={isActive} asChild>
        <Link href={href} className="flex gap-2">
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </BaseSidebarMenuItem>
  );
}
