"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface ModuleIconProps {
  svg: string;
  lightModeColor: string;
  darkModeColor: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ModuleIcon({
  svg,
  lightModeColor,
  darkModeColor,
  size = "md",
  className,
}: ModuleIconProps) {
  const { resolvedTheme } = useTheme();

  const color = resolvedTheme === "dark" ? darkModeColor : lightModeColor;

  const sizeClass = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
  }[size];

  return (
    <div
      className={cn(
        "rounded-md shrink-0 flex items-center justify-center",
        sizeClass,
        className,
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <div
        className="size-full flex items-center justify-center"
        style={{
          fill: `#${color}`,
        }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{
          __html: svg,
        }}
      />
    </div>
  );
}
