import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, MapPin, Phone, HelpCircle } from "lucide-react";
import { useOrders } from "@/lib/store/orders";
import { formatRs } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/mock/types";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({ meta: [{ title: "Tracking — DineQ" }] }),
  component: OrderTrackingPage,
});

const STEPS: { key: OrderStatus; label: string; emoji: string }[] = [
  { key: "placed", label: "Order placed", emoji: "📝" },
  { key: "accepted", label: "Restaurant accepted", emoji: "✅" },
  { key: "preparing", label: "Preparing your order", emoji: "👨‍🍳" },
  { key: "ready", label: "Ready for you", emoji: "🛍️" },
];

function OrderTrackingPage() {
  const { id } = Route.useParams();
  const order = useOrders((s) => s.get(id));
  if (!order) throw notFound();

  const activeIndex = STEPS.findIndex((s) => s.key === order.status);
  const eta = order.readyAt ? new Date(order.readyAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : null;

  return (
    <div className="flex flex-col bg-surface-2/60">
      <header className="safe-pt sticky top-0 z-20 flex items-center justify-between bg-background/85 px-4 py-3 backdrop-blur-xl">
        <Link to="/orders" className="tap grid h-10 w-10 place-items-center rounded-full bg-surface shadow-card">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="text-center">
          <p className="font-display text-base font-bold">{order.number}</p>
          <p className="text-[11px] text-muted-foreground">
            {order.fulfillment === "pickup" ? "Pickup" : "Dine-in"}
          </p>
        </div>
        <div className="w-10" />
      </header>

      {/* Status hero */}
      <div className="mx-4 mt-3 rounded-3xl bg-foreground p-5 text-background shadow-pop">
        <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
          {order.status === "completed" ? "Completed" : "Estimated ready by"}
        </p>
        <p className="mt-1 font-display text-3xl font-extrabold">
          {order.status === "completed" ? "Thanks for ordering" : eta ?? "Soon"}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs opacity-80">
          <Clock className="h-3.5 w-3.5" />
          <span>{order.restaurantName}</span>
        </div>
      </div>

      {/* Timeline */}
      <section className="mt-5 px-4">
        <ol className="space-y-0">
          {STEPS.map((s, i) => {
            const done = i <= activeIndex || order.status === "completed";
            const isCurrent = i === activeIndex && order.status !== "completed";
            return (
              <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
                {i < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-[18px] top-9 h-full w-0.5",
                      done ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full transition",
                    done
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-surface-2 text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/20",
                  )}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <span className="text-sm">{s.emoji}</span>}
                </span>
                <div className="flex-1 pt-1">
                  <p className={cn("text-sm font-bold", done ? "text-foreground" : "text-muted-foreground")}>
                    {s.label}
                  </p>
                  {isCurrent && (
                    <p className="mt-0.5 text-[11px] font-semibold text-primary">In progress</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Restaurant card */}
      <section className="mt-5 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
          <img src={order.restaurantLogo} alt="" className="h-12 w-12 rounded-xl object-cover" />
          <div className="flex-1">
            <p className="text-sm font-bold">{order.restaurantName}</p>
            <p className="text-[11px] text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3" />
              {order.fulfillment === "pickup" ? "Pickup at counter" : "Bring to your table"}
            </p>
          </div>
          <a
            href="tel:+9779800000000"
            className="tap grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary"
          >
            <Phone className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Items */}
      <section className="mt-5 px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Order details
        </h2>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <ul className="space-y-2.5">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    <span className="text-muted-foreground">{i.qty}×</span> {i.name}
                  </p>
                  {(i.variantName || (i.modifierNames && i.modifierNames.length > 0)) && (
                    <p className="text-[11px] text-muted-foreground">
                      {[i.variantName, ...(i.modifierNames ?? [])].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-semibold">{formatRs(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="my-3 border-t border-dashed border-border" />
          <div className="space-y-1 text-sm">
            <Row label="Subtotal" value={formatRs(order.subtotal)} />
            {order.discount > 0 && <Row label="Discount" value={`− ${formatRs(order.discount)}`} muted />}
            {order.serviceCharge > 0 && <Row label="Service" value={formatRs(order.serviceCharge)} muted />}
            <Row label="Tax" value={formatRs(order.tax)} muted />
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-base font-extrabold">Total</span>
              <span className="font-display text-lg font-extrabold">{formatRs(order.total)}</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-[11px] font-bold text-success">
              <Check className="h-3 w-3" strokeWidth={3} /> Paid
            </div>
          </div>
        </div>
      </section>

      {/* Help */}
      <section className="mt-5 px-4 pb-10">
        <button className="tap flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-card">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary">
            <HelpCircle className="h-4 w-4" />
          </span>
          <span className="flex-1">
            <p className="text-sm font-bold">Need help with this order?</p>
            <p className="text-[11px] text-muted-foreground">We usually reply in under 5 minutes.</p>
          </span>
        </button>
      </section>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={cn(muted ? "text-muted-foreground" : "")}>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
