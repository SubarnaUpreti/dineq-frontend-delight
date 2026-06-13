import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "./safe-storage";
import type { MenuItem, ModifierGroup } from "../mock/types";
import { getRestaurant } from "../mock/data";

export type CartLine = {
  lineId: string;
  itemId: string;
  restaurantId: string;
  name: string;
  image: string;
  variantId?: string;
  variantName?: string;
  modifierIds: string[];
  modifierNames: string[];
  modifierPriceSum: number;
  basePrice: number; // variant or item base
  unitPrice: number; // basePrice + modifier deltas
  qty: number;
  notes?: string;
};

type CartState = {
  restaurantId: string | null;
  restaurantName: string | null;
  lines: CartLine[];
  pendingAdd: { item: MenuItem; build: Omit<CartLine, "lineId" | "itemId" | "restaurantId" | "name" | "image"> } | null;
  addLine: (
    item: MenuItem,
    build: Omit<CartLine, "lineId" | "itemId" | "restaurantId" | "name" | "image">,
  ) => "added" | "conflict";
  confirmReplace: () => void;
  cancelReplace: () => void;
  setQty: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  subtotal: () => number;
  itemCount: () => number;
};

const lineSig = (l: Omit<CartLine, "lineId" | "qty">) =>
  [l.itemId, l.variantId ?? "", [...l.modifierIds].sort().join(","), l.notes ?? ""].join("|");

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      lines: [],
      pendingAdd: null,
      addLine: (item, build) => {
        const state = get();
        if (state.restaurantId && state.restaurantId !== item.restaurantId && state.lines.length > 0) {
          set({ pendingAdd: { item, build } });
          return "conflict";
        }
        const restaurant = getRestaurant(item.restaurantId);
        const incoming: Omit<CartLine, "lineId"> = {
          ...build,
          itemId: item.id,
          restaurantId: item.restaurantId,
          name: item.name,
          image: item.image,
        };
        const sig = lineSig(incoming);
        const existing = state.lines.find((l) => lineSig(l) === sig);
        if (existing) {
          set({
            lines: state.lines.map((l) =>
              l.lineId === existing.lineId ? { ...l, qty: l.qty + build.qty } : l,
            ),
          });
        } else {
          const lineId = crypto.randomUUID();
          set({
            restaurantId: item.restaurantId,
            restaurantName: restaurant?.name ?? null,
            lines: [...state.lines, { ...incoming, lineId }],
          });
        }
        return "added";
      },
      confirmReplace: () => {
        const { pendingAdd } = get();
        if (!pendingAdd) return;
        set({ lines: [], restaurantId: null, restaurantName: null, pendingAdd: null });
        get().addLine(pendingAdd.item, pendingAdd.build);
      },
      cancelReplace: () => set({ pendingAdd: null }),
      setQty: (lineId, qty) => {
        if (qty <= 0) return get().removeLine(lineId);
        set({ lines: get().lines.map((l) => (l.lineId === lineId ? { ...l, qty } : l)) });
      },
      removeLine: (lineId) => {
        const lines = get().lines.filter((l) => l.lineId !== lineId);
        set({
          lines,
          ...(lines.length === 0 ? { restaurantId: null, restaurantName: null } : {}),
        });
      },
      clear: () => set({ lines: [], restaurantId: null, restaurantName: null, pendingAdd: null }),
      subtotal: () => get().lines.reduce((s, l) => s + l.unitPrice * l.qty, 0),
      itemCount: () => get().lines.reduce((s, l) => s + l.qty, 0),
    }),
    { name: "dineq.cart", partialize: (s) => ({ lines: s.lines, restaurantId: s.restaurantId, restaurantName: s.restaurantName }) },
  ),
);

export const buildLineFromSelections = (
  item: MenuItem,
  selections: {
    variantId?: string;
    modifierSelections: Record<string, string[]>;
    qty: number;
    notes?: string;
  },
) => {
  const variant = item.variants?.find((v) => v.id === selections.variantId);
  const basePrice = variant?.price ?? item.price;
  let modifierPriceSum = 0;
  const modifierIds: string[] = [];
  const modifierNames: string[] = [];
  for (const group of item.modifierGroups ?? []) {
    const picks = selections.modifierSelections[group.id] ?? [];
    for (const optId of picks) {
      const opt = group.options.find((o) => o.id === optId);
      if (!opt) continue;
      modifierIds.push(`${group.id}:${opt.id}`);
      modifierNames.push(opt.name);
      modifierPriceSum += opt.price;
    }
  }
  return {
    variantId: variant?.id,
    variantName: variant?.name,
    modifierIds,
    modifierNames,
    modifierPriceSum,
    basePrice,
    unitPrice: basePrice + modifierPriceSum,
    qty: selections.qty,
    notes: selections.notes,
  };
};

export const validateRequired = (
  groups: ModifierGroup[] | undefined,
  selections: Record<string, string[]>,
) => {
  if (!groups) return true;
  return groups.every((g) => {
    const picks = selections[g.id] ?? [];
    if (g.required && picks.length < g.min) return false;
    if (picks.length > g.max) return false;
    return true;
  });
};
