import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useOrders } from "@/lib/store/orders";
import { EmptyState } from "@/components/common/EmptyState";
import { formatRs } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/mock/types";

export const Route = createFileRoute("/orders/")({
  head: () => ({ meta: [{ title: "Your orders — DineQ" }] }),
  component: OrdersPage,
});

const STATUS: Record<string, { label: string; color: string }> = {
  placed: { label: "Placed", color: "bg-primary text-primary-foreground" },
  accepted: { label: "Accepted", color: "bg-primary text-primary-foreground" },
  preparing: { label: "Preparing", color: "bg-warning text-warning-foreground" },
  ready: { label: "Ready", color: "bg-success text-success-foreground" },
  completed: { label: "Completed", color: "bg-surface-2 text-muted-foreground" },
};

function OrdersPage() {
  const active = useOrders((s) => s.active());
  const past = useOrders((s) => s.past());
  const [tab, setTab] = useState<"active" | "past">(active.length > 0 ? "active" : "past");

  const list = tab === "active" ? active : past;

  return (
    <div className="flex flex-col">
      <header className="safe-pt sticky top-0 z-20 bg-background/85 px-4 pb-2 pt-4 backdrop-blur-xl">
        <h1 className="font-display text-2xl font-extrabold">Orders</h1>
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-surface-2 p-1">
          {(["active", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "tap h-9 rounded-full text-xs font-bold capitalize transition",
                tab === t ? "bg-background text-foreground shadow-card" : "text-muted-foreground",
              )}
            >
              {t} {t === "active" ? `(${active.length})` : `(${past.length})`}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-4">
        {list.length === 0 ? (
          <EmptyState
            emoji="🍽️"
            title={tab === "active" ? "No active orders" : "No past orders yet"}
            description={
              tab === "active"
                ? "When you place an order, you can track it here in real time."
                : "Your order history will live here once you've ordered."
            }
            action={
              <Link
                to="/"
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-pill"
              >
                Start an order
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {list.map((o) => (
              <li key={o.id}>
                <OrderCard o={o} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function OrderCard({ o }: { o: Order }) {
  const s = STATUS[o.status] ?? STATUS.completed;
  return (
    <Link
      to="/orders/$id"
      params={{ id: o.id }}
      className="tap block overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card transition active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <img src={o.restaurantLogo} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold">{o.restaurantName}</p>
              <p className="text-[11px] text-muted-foreground">
                {o.number} · {new Date(o.placedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </p>
            </div>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", s.color)}>
              {s.label}
            </span>
          </div>
          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
            {o.items.map((i) => `${i.qty}× ${i.name}`).join(" · ")}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {o.fulfillment === "pickup" ? "Pickup" : "Dine-in"}
            </span>
            <span className="text-sm font-extrabold">{formatRs(o.total)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
