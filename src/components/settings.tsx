"use client";

import type React from "react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  className,
  ...props
}: SettingsSectionProps) {
  return (
    <div
      className={cn("rounded-xl py-6 transition-all duration-200", className)}
      {...props}
    >
      <h2 className="text-xl font-medium mb-2 text-primary">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

interface SettingsItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function SettingsItem({
  title,
  description,
  children,
  className,
  ...props
}: SettingsItemProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-center p-4 bg-background/50 rounded-lg border border-border transition-all duration-200",
        className,
      )}
      {...props}
    >
      <div>
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="transition-all hover:brightness-110">{children}</div>
    </div>
  );
}
