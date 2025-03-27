"use client";

import type React from "react";
import type { ModuleWithRequirements } from "@/actions/modules/list-modules";

export type DialogType = "alert" | "confirm" | "prompt" | "moduleConfig";

export interface DialogButtonOptions {
  text?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export interface DialogOptions {
  type: DialogType;
  title: React.ReactNode;
  message: React.ReactNode;
  defaultValue?: string;
  modules?: ModuleWithRequirements[];
  okButton?: DialogButtonOptions;
  cancelButton?: DialogButtonOptions;
}

export interface DialogQueueItem<T> extends DialogOptions {
  id: string;
  resolve: (value: T) => void;
}