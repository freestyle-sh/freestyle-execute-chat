"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DialogQueueItem } from "./types";
import { useDialogStore } from "./store";

export function AlertDialog({
  dialog: { title, message, okButton },
}: {
  dialog: DialogQueueItem<void>;
}) {
  const resolve = useDialogStore((state) => state.resolveDialog);

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
              className="text-blue-500"
            >
              <title>Alert</title>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {title}
        </DialogTitle>
        <div className="text-sm text-muted-foreground whitespace-pre-line">
          {message}
        </div>
      </DialogHeader>

      <DialogFooter>
        <Button 
          onClick={() => resolve(undefined)} 
          className="ml-auto"
          variant={okButton?.variant ?? "default"}
        >
          {okButton?.text ?? "OK"}
        </Button>
      </DialogFooter>
    </>
  );
}

