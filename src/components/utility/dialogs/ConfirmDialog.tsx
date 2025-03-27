"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DialogQueueItem } from "./types";
import { useDialogStore } from "./store";

export function ConfirmDialog({
  dialog: { title, message, okButton, cancelButton },
}: {
  dialog: DialogQueueItem<boolean>;
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
              className="text-amber-500"
            >
              <title>Alert</title>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
          {title}
        </DialogTitle>
        <div className="text-sm text-muted-foreground whitespace-pre-line">
          {message}
        </div>
      </DialogHeader>

      <DialogFooter className="flex justify-end max-sm:justify-between">
        <Button 
          variant={cancelButton?.variant ?? "outline"} 
          onClick={() => resolve(false)}
        >
          {cancelButton?.text ?? "Cancel"}
        </Button>
        <Button 
          variant={okButton?.variant ?? "default"}
          onClick={() => resolve(true)}
        >
          {okButton?.text ?? "OK"}
        </Button>
      </DialogFooter>
    </>
  );
}
