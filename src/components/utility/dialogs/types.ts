"use client";

import type React from "react";

export type DialogType = "alert" | "confirm" | "prompt";

export interface DialogOptions {
  type: DialogType;
  title: React.ReactNode;
  message: React.ReactNode;
  defaultValue?: string;
}

export interface DialogQueueItem<T> extends DialogOptions {
  id: string;
  resolve: (value: T) => void;
}
