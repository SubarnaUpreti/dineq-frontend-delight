import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "./safe-storage";

type FavState = {
  ids: string[];
  toggle: (id: string) => boolean;
  has: (id: string) => boolean;
};

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const has = get().ids.includes(id);
        set({ ids: has ? get().ids.filter((x) => x !== id) : [...get().ids, id] });
        return !has;
      },
      has: (id) => get().ids.includes(id),
    }),
    { name: "dineq.favorites", storage: safeStorage, skipHydration: true },
  ),
);
