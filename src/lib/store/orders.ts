import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "./safe-storage";
import type { Order, OrderStatus } from "../mock/types";
import { seedOrders } from "../mock/data";

type OrdersState = {
  orders: Order[];
  addOrder: (o: Order) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
  get: (id: string) => Order | undefined;
  active: () => Order[];
  past: () => Order[];
};

export const useOrders = create<OrdersState>()(
  persist(
    (set, getState) => ({
      orders: seedOrders,
      addOrder: (o) => set({ orders: [o, ...getState().orders] }),
      updateStatus: (id, status) =>
        set({ orders: getState().orders.map((o) => (o.id === id ? { ...o, status } : o)) }),
      get: (id) => getState().orders.find((o) => o.id === id),
      active: () =>
        getState().orders.filter((o) => o.status !== "completed").sort((a, b) => b.placedAt.localeCompare(a.placedAt)),
      past: () =>
        getState().orders.filter((o) => o.status === "completed").sort((a, b) => b.placedAt.localeCompare(a.placedAt)),
    }),
    { name: "dineq.orders" },
  ),
);
