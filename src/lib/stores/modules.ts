"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ModuleState = {
  enabled: boolean;
};

type ModulesStore = {
  selectedModules: Record<string, ModuleState>;
  toggleModule: (moduleId: string, enabled: boolean) => void;
  getSelectedModules: () => Record<string, ModuleState>;
  clearSelectedModules: () => void;
};

export const useModulesStore = create<ModulesStore>()(
  persist(
    (set, get) => ({
      selectedModules: {},
      
      toggleModule: (moduleId: string, enabled: boolean) => {
        set((state) => ({
          selectedModules: {
            ...state.selectedModules,
            [moduleId]: { enabled }
          }
        }));
      },
      
      getSelectedModules: () => get().selectedModules,
      
      clearSelectedModules: () => set({ selectedModules: {} }),
    }),
    {
      name: "modules-store",
    }
  )
);