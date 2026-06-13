import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "./safe-storage";

type User = {
  name: string;
  phone: string;
  loggedIn: boolean;
};

type UserState = {
  user: User;
  setName: (n: string) => void;
  setPhone: (p: string) => void;
  login: (u: { name: string; phone: string }) => void;
  logout: () => void;
};

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      user: { name: "Aarav Sharma", phone: "+977 98XX XXX 421", loggedIn: true },
      setName: (n) => set((s) => ({ user: { ...s.user, name: n } })),
      setPhone: (p) => set((s) => ({ user: { ...s.user, phone: p } })),
      login: (u) => set({ user: { ...u, loggedIn: true } }),
      logout: () => set({ user: { name: "", phone: "", loggedIn: false } }),
    }),
    { name: "dineq.user", storage: safeStorage },
  ),
);
