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
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
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
  );
}
