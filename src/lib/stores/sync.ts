import type { StoreApi, UseBoundStore } from "zustand";
import type { PersistOptions } from "zustand/middleware";

type PersistListener<S> = (state: S) => void;
type StorePersist<S, Ps> = {
  persist: {
    setOptions: (options: Partial<PersistOptions<S, Ps>>) => void;
    clearStorage: () => void;
    rehydrate: () => Promise<void> | void;
    hasHydrated: () => boolean;
    onHydrate: (fn: PersistListener<S>) => () => void;
    onFinishHydration: (fn: PersistListener<S>) => () => void;
    getOptions: () => Partial<PersistOptions<S, Ps>>;
  };
};
type Write<T, U> = Omit<T, keyof U> & U;

/**
 * Sync a persistent Zustand store between tabs.
 */
export function withStorageDOMEvents<T>(
  store: UseBoundStore<Write<StoreApi<T>, StorePersist<T, T>>>,
) {
  if (globalThis.window === undefined) {
    return;
  }

  const storageEventCallback = (e: StorageEvent) => {
    if (e.key === store.persist.getOptions().name && e.newValue) {
      store.persist.rehydrate();
    }
  };

  window.addEventListener("storage", storageEventCallback);

  return () => {
    window.removeEventListener("storage", storageEventCallback);
  };
}
