import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Tag as TagIcon, Trash2, ShoppingBag, Utensils, type LucideIcon } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useUser } from "@/lib/store/user";
import { useOrders } from "@/lib/store/orders";
import { getRestaurant, promos } from "@/lib/mock/data";
import { formatRs } from "@/lib/format";
import { EmptyState } from "@/components/common/EmptyState";
import { QuantityStepper } from "@/components/common/QuantityStepper";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Order } from "@/lib/mock/types";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — DineQ" },
      { name: "description", content: "Review your order, apply a promo, and checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const lines = useCart((s) => s.lines);
  const restaurantId = useCart((s) => s.restaurantId);
  const restaurantName = useCart((s) => s.restaurantName);
  const subtotal = useCart((s) => s.subtotal());
  const setQty = useCart((s) => s.setQty);
  const removeLine = useCart((s) => s.removeLine);
  const clear = useCart((s) => s.clear);
  const restaurant = restaurantId ? getRestaurant(restaurantId) : null;
  const user = useUser((s) => s.user);
  const navigate = useNavigate();
  const addOrder = useOrders((s) => s.addOrder);

  const [fulfillment, setFulfillment] = useState<"pickup" | "dinein">(
    restaurant?.pickup ? "pickup" : "dinein",
  );
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [notes, setNotes] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoErr, setPromoErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const promo = useMemo(() => promos.find((p) => p.code === promoCode) ?? null, [promoCode]);

  const discount = useMemo(() => {
    if (!promo) return 0;
    if (promo.minOrder && subtotal < promo.minOrder) return 0;
    if (promo.kind === "percent") {
      const d = (subtotal * promo.value) / 100;
      return promo.max ? Math.min(promo.max, d) : d;
    }
    return promo.value;
  }, [promo, subtotal]);

  const serviceCharge = restaurant ? Math.round(((subtotal - discount) * restaurant.serviceChargePct) / 100) : 0;
  const tax = restaurant ? Math.round(((subtotal - discount + serviceCharge) * restaurant.taxPct) / 100) : 0;
  const total = Math.max(0, subtotal - discount + serviceCharge + tax);

  const minOrder = restaurant?.minOrder ?? 0;
  const needsMore = Math.max(0, minOrder - subtotal);
  const meetsMin = subtotal >= minOrder;

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    const p = promos.find((x) => x.code === code);
    if (!p) return setPromoErr("That code isn't valid.");
    if (p.minOrder && subtotal < p.minOrder) {
      return setPromoErr(`Add ${formatRs(p.minOrder - subtotal)} more to use ${code}.`);
    }
    setPromoCode(p.code);
    setPromoErr(null);
    toast.success(`Promo ${p.code} applied`);
  };

  const checkout = async () => {
    if (!meetsMin || submitting || !restaurant) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const order: Order = {
      id: crypto.randomUUID(),
      number: `DQ-${Math.floor(1000 + Math.random() * 9000)}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantLogo: restaurant.logo,
      fulfillment,
      status: "placed",
      placedAt: new Date().toISOString(),
      readyAt: new Date(Date.now() + restaurant.prepMinutes[1] * 60 * 1000).toISOString(),
      items: lines.map((l) => ({
        id: l.itemId,
        name: l.name,
        qty: l.qty,
        price: l.unitPrice,
        variantName: l.variantName,
        modifierNames: l.modifierNames,
        image: l.image,
      })),
      subtotal,
      discount,
      serviceCharge,
      tax,
      total,
      customerName: name,
      customerPhone: phone,
      paid: false,
    };
    addOrder(order);
    clear();
    navigate({ to: "/pay/$orderId", params: { orderId: order.id } });
  };

  if (lines.length === 0) {
    return (
      <div className="flex flex-col">
        <CartHeader />
        <EmptyState
          emoji="🛍️"
          title="Your cart is empty"
          description="Browse restaurants and add something delicious to get started."
          action={
            <Link
              to="/"
              className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-pill"
            >
              Explore restaurants
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface-2/60">
      <CartHeader onClear={clear} />

      {/* Restaurant strip */}
      {restaurant && (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
          <img src={restaurant.logo} alt="" className="h-10 w-10 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              From
            </p>
            <p className="truncate font-display text-sm font-bold">{restaurantName}</p>
          </div>
          <Link to="/restaurant/$id" params={{ id: restaurant.id }} className="text-xs font-bold text-primary">
            Add more
          </Link>
        </div>
      )}

      {/* Items */}
      <section className="mt-4 px-4">
        <h2 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {lines.length} {lines.length === 1 ? "item" : "items"}
        </h2>
        <ul className="space-y-2">
          {lines.map((l) => (
            <li key={l.lineId} className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
              <img src={l.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-bold">{l.name}</p>
                  <p className="shrink-0 text-sm font-extrabold">{formatRs(l.unitPrice * l.qty)}</p>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                  {[l.variantName, ...l.modifierNames].filter(Boolean).join(" · ") || "Standard"}
                </p>
                {l.notes && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] italic text-muted-foreground">
                    Note: {l.notes}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <QuantityStepper
                    size="sm"
                    value={l.qty}
                    onChange={(v) => setQty(l.lineId, v)}
                  />
                  <button
                    onClick={() => removeLine(l.lineId)}
                    aria-label="Remove"
                    className="tap grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-surface-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Fulfillment */}
      <section className="mt-5 px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          How are you collecting?
        </h2>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-1.5">
          <FulfillBtn
            active={fulfillment === "pickup"}
            onClick={() => setFulfillment("pickup")}
            disabled={!restaurant?.pickup}
            label="Pickup"
            sub="Skip the line"
            emoji="🛍️"
          />
          <FulfillBtn
            active={fulfillment === "dinein"}
            onClick={() => setFulfillment("dinein")}
            disabled={!restaurant?.dineIn}
            label="Dine-in"
            sub="Ready at table"
            emoji="🪑"
          />
        </div>
      </section>

      {/* Identity */}
      <section className="mt-5 px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Your details
        </h2>
        <div className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-card">
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-sm font-medium focus:outline-none"
              placeholder="Full name"
            />
          </Field>
          <Field label="Phone">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent text-sm font-medium focus:outline-none"
              placeholder="+977 …"
              inputMode="tel"
            />
          </Field>
        </div>
      </section>

      {/* Order notes */}
      <section className="mt-5 px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Order note
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Any instructions for the restaurant?"
          className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
        />
      </section>

      {/* Promo */}
      <section className="mt-5 px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Promo code
        </h2>
        {promo ? (
          <div className="flex items-center gap-3 rounded-2xl border border-success/40 bg-success/8 p-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-success/15 text-success">
              <TagIcon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-success">{promo.code} applied</p>
              <p className="text-[11px] text-success/85">{promo.label}</p>
            </div>
            <button
              onClick={() => setPromoCode(null)}
              className="text-xs font-bold text-success"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoErr(null); }}
                placeholder="DINEQ10"
                className="h-11 flex-1 rounded-full border border-border bg-card px-4 text-sm font-semibold tracking-wider focus:border-primary focus:outline-none"
              />
              <button
                onClick={applyPromo}
                disabled={!promoInput.trim()}
                className="tap h-11 rounded-full bg-foreground px-5 text-xs font-bold text-background disabled:opacity-40"
              >
                Apply
              </button>
            </div>
            {promoErr && <p className="mt-2 text-xs font-semibold text-destructive">{promoErr}</p>}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Try <b>DINEQ10</b>, <b>FLAT100</b>, or <b>FIRST50</b>.
            </p>
          </div>
        )}
      </section>

      {/* Totals */}
      <section className="mt-5 px-4">
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-card">
          <Row label="Subtotal" value={formatRs(subtotal)} />
          {discount > 0 && <Row label="Promo discount" value={`− ${formatRs(discount)}`} accent="success" />}
          {serviceCharge > 0 && <Row label={`Service charge (${restaurant?.serviceChargePct}%)`} value={formatRs(serviceCharge)} />}
          <Row label={`Tax (${restaurant?.taxPct}%)`} value={formatRs(tax)} />
          <div className="my-1 border-t border-dashed border-border" />
          <Row label="Total" value={formatRs(total)} big />
        </div>
      </section>

      {!meetsMin && (
        <section className="mt-3 px-4">
          <div className="rounded-2xl border border-warning/40 bg-warning/12 p-3">
            <div className="flex items-center justify-between text-xs font-bold text-warning-foreground">
              <span>Add {formatRs(needsMore)} more to checkout</span>
              <span>Min {formatRs(minOrder)}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60">
              <div
                className="h-full bg-warning transition-all"
                style={{ width: `${Math.min(100, (subtotal / minOrder) * 100)}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Sticky checkout */}
      <div className="safe-pb sticky bottom-0 mt-6 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur-xl">
        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={!meetsMin || submitting}
          onClick={checkout}
          className="tap flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-pill disabled:opacity-50 disabled:shadow-none"
        >
          {submitting ? (
            <span>Processing…</span>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>Continue to payment · {formatRs(total)}</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

function CartHeader({ onClear }: { onClear?: () => void }) {
  return (
    <header className="safe-pt sticky top-0 z-20 flex items-center justify-between bg-background/85 px-4 py-3 backdrop-blur-xl">
      <Link
        to="/"
        className="tap grid h-10 w-10 place-items-center rounded-full bg-surface text-foreground shadow-card"
        aria-label="Back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <h1 className="font-display text-lg font-extrabold">Your cart</h1>
      {onClear ? (
        <button onClick={onClear} className="text-xs font-bold text-destructive">
          Clear
        </button>
      ) : (
        <div className="w-10" />
      )}
    </header>
  );
}

function FulfillBtn({
  active, onClick, disabled, label, sub, emoji,
}: {
  active: boolean; onClick: () => void; disabled?: boolean; label: string; sub: string; emoji: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "tap flex flex-col items-start rounded-xl px-4 py-3 text-left transition disabled:opacity-50",
        active ? "bg-background shadow-card" : "bg-transparent",
      )}
    >
      <span className="text-xl">{emoji}</span>
      <span className={cn("mt-1 text-sm font-bold", active ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
      <span className="text-[11px] text-muted-foreground">{sub}</span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}

function Row({ label, value, big, accent }: { label: string; value: string; big?: boolean; accent?: "success" }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={cn(big ? "text-base font-bold" : "text-sm text-muted-foreground")}>{label}</span>
      <span
        className={cn(
          big ? "font-display text-xl font-extrabold" : "text-sm font-semibold",
          accent === "success" && "text-success",
        )}
      >
        {value}
      </span>
    </div>
  );
}
