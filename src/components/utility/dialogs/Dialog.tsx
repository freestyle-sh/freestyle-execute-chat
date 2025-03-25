"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDialogStore } from "./store";
import { AlertDialog } from "./AlertDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { PromptDialog } from "./PromptDialog";

const dialogTypes = {
  alert: AlertDialog,
  confirm: ConfirmDialog,
  prompt: PromptDialog,
};

export function DialogProvider() {
  const { activeDialog, resolveDialog } = useDialogStore();

  const handleOpenChange = (open: boolean) => {
    if (!open && activeDialog) {
      resolveDialog(null);
    }
  };

  if (!activeDialog) {
    return null;
  }

  const Component = dialogTypes[activeDialog.type];

  return (
    <Dialog open={!!activeDialog} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Component dialog={activeDialog} />
      </DialogContent>
    </Dialog>
  );
}
