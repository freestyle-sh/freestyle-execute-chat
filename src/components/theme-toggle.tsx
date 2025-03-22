"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Computer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ClientOnly from "./client-only";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <ClientOnly>
      <div className="flex justify-end w-full">
        <Select value={theme} onValueChange={(value) => setTheme(value)}>
          <SelectTrigger className="w-36 cursor-pointer">
            <SelectValue
              placeholder={
                <div className="flex items-center gap-2">
                  <Computer className="h-4 w-4" />
                  <span>System</span>
                </div>
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="cursor-pointer" value="light">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </div>
            </SelectItem>
            <SelectItem className="cursor-pointer" value="dark">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </div>
            </SelectItem>
            <SelectItem className="cursor-pointer" value="system">
              <div className="flex items-center gap-2">
                <Computer className="h-4 w-4" />
                <span>System</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </ClientOnly>
  );
}
