"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { withStorageDOMEvents } from "./sync";
import { useEffect } from "react";

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleMobile: () => void;
  closeMobileOnNavigation: () => void;
}

// Create the base store with persistence for desktop sidebar only
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: false,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (open: boolean) => set({ isOpen: open }),
      openMobile: false,
      setOpenMobile: (openMobile: boolean) => set({ openMobile }),
      toggleMobile: () => set((state) => ({ openMobile: !state.openMobile })),
      closeMobileOnNavigation: () => {
        set({ openMobile: false });
      },
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({ isOpen: state.isOpen }), // Only persist desktop sidebar state
    },
  ),
);

// Create a hook to ensure mobile sidebar starts closed
export function useSidebarInit() {
  const setOpenMobile = useSidebarStore((state) => state.setOpenMobile);
  
  useEffect(() => {
    // Reset mobile sidebar state to closed on initial load
    setOpenMobile(false);
  }, [setOpenMobile]);
}

// Comment out until type issues are resolved
// withStorageDOMEvents(useSidebarStore);
