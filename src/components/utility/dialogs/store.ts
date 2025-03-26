"use client";

import type React from "react";
import { create } from "zustand";
import type { DialogType, DialogQueueItem, DialogButtonOptions } from "./types";
import type { ModuleWithRequirements } from "@/actions/modules/list-modules";

interface DialogState {
  queue: DialogQueueItem<unknown>[];
  activeDialog: DialogQueueItem<unknown> | null;
  isProcessing: boolean;

  enqueueDialog: <T>(
    type: DialogType,
    title: React.ReactNode,
    message: React.ReactNode,
    defaultValue?: string,
    modules?: ModuleWithRequirements[],
    options?: {
      okButton?: DialogButtonOptions;
      cancelButton?: DialogButtonOptions;
    },
  ) => Promise<T>;

  resolveDialog: <T>(result: T) => void;
  processQueue: () => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  queue: [],
  activeDialog: null,
  isProcessing: false,

  enqueueDialog<T>(
    type: DialogType,
    title: React.ReactNode,
    message: React.ReactNode,
    defaultValue?: string,
    modules?: ModuleWithRequirements[],
    options?: {
      okButton?: DialogButtonOptions;
      cancelButton?: DialogButtonOptions;
    },
  ) {
    return new Promise<T>((resolve) => {
      const dialogId = Math.random().toString(36).substring(2, 9);

      set((state) => ({
        queue: [
          ...state.queue,
          {
            id: dialogId,
            type,
            title,
            message,
            defaultValue,
            modules,
            okButton: options?.okButton,
            cancelButton: options?.cancelButton,
            resolve: resolve as (value: unknown) => void,
          },
        ],
      }));

      const { isProcessing } = get();
      if (!isProcessing) {
        get().processQueue();
      }
    });
  },

  resolveDialog: (result) => {
    const { activeDialog } = get();
    if (activeDialog) {
      // Resolve the active dialog's promise
      activeDialog.resolve(result);

      // Clear the active dialog and process the next one
      set({ activeDialog: null });
      get().processQueue();
    }
  },

  processQueue: () => {
    const { queue, activeDialog } = get();

    // If there's already an active dialog or no dialogs in queue, do nothing
    if (activeDialog || queue.length === 0) {
      set({ isProcessing: false });
      return;
    }

    set({ isProcessing: true });

    const [nextDialog, ...remainingQueue] = queue;

    set({
      queue: remainingQueue,
      activeDialog: nextDialog,
    });
  },
}));

interface AlertOptions {
  okButton?: DialogButtonOptions;
}

export function alert(
  title: React.ReactNode,
  message: React.ReactNode,
  options?: AlertOptions,
): Promise<boolean> {
  return useDialogStore
    .getState()
    .enqueueDialog("alert", title, message, undefined, undefined, {
      okButton: options?.okButton,
    }) as Promise<boolean>;
}

interface ConfirmOptions {
  okButton?: DialogButtonOptions;
  cancelButton?: DialogButtonOptions;
}

export function confirm(
  title: React.ReactNode,
  message: React.ReactNode,
  options?: ConfirmOptions,
): Promise<boolean> {
  return useDialogStore
    .getState()
    .enqueueDialog("confirm", title, message, undefined, undefined, {
      okButton: options?.okButton,
      cancelButton: options?.cancelButton,
    }) as Promise<boolean>;
}

interface PromptOptions {
  okButton?: DialogButtonOptions;
  cancelButton?: DialogButtonOptions;
  defaultValue?: string;
}

export function prompt(
  title: React.ReactNode,
  message: React.ReactNode,
  options?: string | PromptOptions,
): Promise<string | null> {
  // Handle the case where options is a string (for backward compatibility)
  const defaultValue =
    typeof options === "string" ? options : (options?.defaultValue ?? "");
  const dialogOptions = typeof options === "string" ? {} : options;

  return useDialogStore
    .getState()
    .enqueueDialog("prompt", title, message, defaultValue, undefined, {
      okButton: dialogOptions?.okButton,
      cancelButton: dialogOptions?.cancelButton,
    }) as Promise<string | null>;
}

export function configureModules(
  modules: ModuleWithRequirements[],
): Promise<boolean> {
  return useDialogStore
    .getState()
    .enqueueDialog(
      "moduleConfig",
      "Module Configuration",
      "Configure modules required for this action",
      undefined,
      modules,
    ) as Promise<boolean>;
}

