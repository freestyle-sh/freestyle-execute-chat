"use client";

import { useState, useEffect } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DialogQueueItem } from "./types";
import { useDialogStore } from "./store";

export function PromptDialog({
  dialog: { title, message, defaultValue },
}: {
  dialog: DialogQueueItem<string | null>;
}) {
  const resolve = useDialogStore((state) => state.resolveDialog);
  const [inputValue, setInputValue] = useState(defaultValue ?? "");

  useEffect(() => {
    setInputValue(defaultValue ?? "");
  }, [defaultValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      resolve(inputValue);
    } else if (e.key === "Escape") {
      resolve(null);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {typeof title === "string" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-violet-500"
            >
              <title>Prompt</title>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          )}
          {title}
        </DialogTitle>
        <div className="text-sm text-muted-foreground whitespace-pre-line">
          {message}
        </div>
      </DialogHeader>

      <div className="py-4">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your response"
          autoFocus
          className="w-full"
          onKeyDown={handleKeyDown}
        />
      </div>

      <DialogFooter className="flex sm:justify-between">
        <Button variant="outline" onClick={() => resolve(null)}>
          Cancel
        </Button>
        <Button onClick={() => resolve(inputValue)}>Submit</Button>
      </DialogFooter>
    </>
  );
}

