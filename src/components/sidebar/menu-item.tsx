import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  SidebarMenuItem as BaseSidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useSidebarStore } from "@/stores/sidebar";

interface SidebarMenuItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  tooltip?: string;
  className?: string;
}

export function SidebarMenuLinkItem({
  href,
  icon: Icon,
  label,
  isActive = false,
  tooltip,
  className,
  target,
}: SidebarMenuItemProps & {
  target?: string;
  href: string;
}) {
  const { closeMobileOnNavigation } = useSidebarStore();
  return (
    <BaseSidebarMenuItem className={className}>
      <SidebarMenuButton tooltip={tooltip || label} isActive={isActive} asChild>
        <Link 
          href={href} 
          target={target} 
          className="flex gap-2"
          onClick={() => closeMobileOnNavigation()}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </BaseSidebarMenuItem>
  );
}
