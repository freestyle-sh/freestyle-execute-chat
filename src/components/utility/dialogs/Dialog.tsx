"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDialogStore } from "./store";
import { AlertDialog } from "./AlertDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { PromptDialog } from "./PromptDialog";
import { ModuleConfigDialog } from "./ModuleConfigDialog";

const dialogTypes = {
  alert: AlertDialog,
  confirm: ConfirmDialog,
  prompt: PromptDialog,
  moduleConfig: ModuleConfigDialog,
};

export function DialogProvider() {
  const { activeDialog, resolveDialog } = useDialogStore();

  const handleOpenChange = (open: boolean) => {
    if (!open && activeDialog) {
      if (activeDialog.type === "moduleConfig") {
        resolveDialog(false);
      } else {
        resolveDialog(null);
      }
    }
  };

  if (!activeDialog) {
    return null;
  }

  const Component = dialogTypes[activeDialog.type];
  const isModuleConfig = activeDialog.type === "moduleConfig";

  return (
    <Dialog open={!!activeDialog} onOpenChange={handleOpenChange}>
      <DialogContent className={isModuleConfig ? "sm:max-w-[500px]" : "sm:max-w-[425px]"}>
        {/* Use type assertion to handle different dialog types */}
        <Component dialog={activeDialog as any} />
      </DialogContent>
    </Dialog>
  );
}
