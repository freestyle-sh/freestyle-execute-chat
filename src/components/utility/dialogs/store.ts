"use client";

import type React from "react";
import { create } from "zustand";
import type { DialogType, DialogQueueItem } from "./types";

interface DialogState {
  queue: DialogQueueItem<unknown>[];
  activeDialog: DialogQueueItem<unknown> | null;
  isProcessing: boolean;

  enqueueDialog: <T>(
    type: DialogType,
    title: React.ReactNode,
    message: React.ReactNode,
    defaultValue?: string,
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
      setTimeout(() => get().processQueue(), 10);
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

export function alert(
  title: React.ReactNode,
  message: React.ReactNode,
): Promise<boolean> {
  return useDialogStore
    .getState()
    .enqueueDialog("alert", title, message) as Promise<boolean>;
}

export function confirm(
  title: React.ReactNode,
  message: React.ReactNode,
): Promise<boolean> {
  return useDialogStore
    .getState()
    .enqueueDialog("confirm", title, message) as Promise<boolean>;
}

export function prompt(
  title: React.ReactNode,
  message: React.ReactNode,
  defaultValue?: string,
): Promise<string | null> {
  return useDialogStore
    .getState()
    .enqueueDialog("prompt", title, message, defaultValue ?? "") as Promise<
    string | null
  >;
}

