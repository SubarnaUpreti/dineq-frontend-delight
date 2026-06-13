import { createJSONStorage, type StateStorage } from "zustand/middleware";

const memory = new Map<string, string>();
const memoryStorage: StateStorage = {
  getItem: (k) => (memory.has(k) ? (memory.get(k) as string) : null),
  setItem: (k, v) => { memory.set(k, v); },
  removeItem: (k) => { memory.delete(k); },
};

export const safeStorage = createJSONStorage(() => {
  if (typeof window === "undefined") return memoryStorage;
  try {
    return window.localStorage;
  } catch {
    return memoryStorage;
  }
});
