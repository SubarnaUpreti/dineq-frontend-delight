import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Tag as TagIcon,
  Trash2,
  ShoppingBag,
  Utensils,
  Truck,
  Zap,
  Clock,
  Lock,
  Heart,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
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
      { title: "Checkout — DineQ" },
      { name: "description", content: "Review your order, apply a promo, and checkout." },
    ],
  }),
  component: CartPage,
});

type Fulfillment = "dinein" | "pickup" | "delivery";
type Timing = "asap" | "schedule";
type TipChoice = "none" | "5" | "10" | "15" | "custom";

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

  const defaultFulfillment: Fulfillment = restaurant?.pickup
    ? "pickup"
    : restaurant?.dineIn
      ? "dinein"
      : "delivery";

  const [fulfillment, setFulfillment] = useState<Fulfillment>(defaultFulfillment);
  const [timing, setTiming] = useState<Timing>("asap");
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [notes, setNotes] = useState("");
  const [tipChoice, setTipChoice] = useState<TipChoice>("none");
  const [customTip, setCustomTip] = useState("");
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

  const serviceCharge = restaurant
    ? Math.round(((subtotal - discount) * restaurant.serviceChargePct) / 100)
    : 0;
  const tax = restaurant
    ? Math.round(((subtotal - discount + serviceCharge) * restaurant.taxPct) / 100)
    : 0;

  const tip = useMemo(() => {
    if (tipChoice === "none") return 0;
    if (tipChoice === "custom") {
      const n = parseInt(customTip, 10);
      return Number.isFinite(n) && n > 0 ? n : 0;
    }
    const pct = parseInt(tipChoice, 10);
    return Math.round((subtotal * pct) / 100);
  }, [tipChoice, customTip, subtotal]);

  const total = Math.max(0, subtotal - discount + serviceCharge + tax + tip);

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
      fulfillment: fulfillment === "delivery" ? "pickup" : fulfillment,
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
    <div className="flex flex-col bg-surface-2/60 pb-2">
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
          <Link
            to="/restaurant/$id"
            params={{ id: restaurant.id }}
            className="text-xs font-bold text-primary"
          >
            Add more
          </Link>
        </div>
      )}

      {/* Items */}
      <Section title={`${lines.length} ${lines.length === 1 ? "item" : "items"}`}>
        <ul className="space-y-2">
          {lines.map((l) => (
            <li
              key={l.lineId}
              className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
            >
              <img src={l.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-bold">{l.name}</p>
                  <p className="shrink-0 text-sm font-extrabold">
                    {formatRs(l.unitPrice * l.qty)}
                  </p>
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
      </Section>

      {/* Fulfillment */}
      <Section title="How will you get your order?">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-surface-2 p-1.5">
          <FulfillBtn
            active={fulfillment === "dinein"}
            onClick={() => setFulfillment("dinein")}
            disabled={!restaurant?.dineIn}
            label="Dine-in"
            sub="Eat in"
            Icon={Utensils}
          />
          <FulfillBtn
            active={fulfillment === "pickup"}
            onClick={() => setFulfillment("pickup")}
            disabled={!restaurant?.pickup}
            label="Pickup"
            sub="Grab & go"
            Icon={ShoppingBag}
          />
          <FulfillBtn
            active={fulfillment === "delivery"}
            onClick={() => setFulfillment("delivery")}
            label="Delivery"
            sub="To your door"
            Icon={Truck}
          />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          Usually ready in {restaurant?.prepMinutes[0]}–{restaurant?.prepMinutes[1]} minutes
        </p>
      </Section>

      {/* Timing */}
      <Section title="When do you want it?">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-1.5">
          <FulfillBtn
            active={timing === "asap"}
            onClick={() => setTiming("asap")}
            label="ASAP"
            sub={`~${restaurant?.prepMinutes[1] ?? 30} min`}
            Icon={Zap}
          />
          <FulfillBtn
            active={timing === "schedule"}
            onClick={() => setTiming("schedule")}
            label="Schedule"
            sub="Pick a time"
            Icon={Clock}
          />
        </div>
      </Section>

      {/* Identity */}
      <Section title="Your details">
        <div className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-card">
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-sm font-medium focus:outline-none"
              placeholder="Full name"
            />
          </Field>
          <div className="border-t border-dashed border-border" />
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
      </Section>

      {/* Order notes */}
      <Section title="Order note">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Any instructions for the restaurant?"
          className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
        />
      </Section>

      {/* Order summary */}
      <Section title="Order summary">
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-card">
          {restaurant && (
            <>
              <p className="font-display text-sm font-bold">{restaurant.name}</p>
              <div className="space-y-1.5">
                {lines.map((l) => (
                  <div key={l.lineId} className="flex items-baseline justify-between text-sm">
                    <span className="line-clamp-1 pr-3 text-foreground/90">
                      {l.qty} × {l.name}
                    </span>
                    <span className="shrink-0 font-semibold">
                      {formatRs(l.unitPrice * l.qty)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-border" />
            </>
          )}
          <Row label="Subtotal" value={formatRs(subtotal)} />
          {discount > 0 && (
            <Row label="Promo discount" value={`− ${formatRs(discount)}`} accent="success" />
          )}
          {serviceCharge > 0 && (
            <Row
              label={`Service charge (${restaurant?.serviceChargePct}%)`}
              value={formatRs(serviceCharge)}
            />
          )}
          <Row label={`Tax (${restaurant?.taxPct}%)`} value={formatRs(tax)} />
          {tip > 0 && <Row label="Tip" value={formatRs(tip)} />}
          <div className="my-1 border-t border-dashed border-border" />
          <Row label="Total" value={formatRs(total)} big />
        </div>
      </Section>

      {/* Tip */}
      <Section title="Add a tip">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="flex flex-wrap gap-2">
            {(["none", "5", "10", "15", "custom"] as TipChoice[]).map((t) => (
              <button
                key={t}
                onClick={() => setTipChoice(t)}
                className={cn(
                  "tap h-9 rounded-full border px-4 text-xs font-bold transition",
                  tipChoice === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-surface-2",
                )}
              >
                {t === "none" ? "None" : t === "custom" ? "Custom" : `${t}%`}
              </button>
            ))}
          </div>
          {tipChoice === "custom" && (
            <input
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value.replace(/\D/g, ""))}
              placeholder="Tip amount (Rs)"
              inputMode="numeric"
              className="mt-2 h-10 w-full rounded-full border border-border bg-background px-4 text-sm font-semibold focus:border-primary focus:outline-none"
            />
          )}
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Heart className="h-3 w-3" />
            100% of your tip goes to the restaurant team.
          </p>
        </div>
      </Section>

      {/* Promo */}
      <Section title="Promo code">
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
                onChange={(e) => {
                  setPromoInput(e.target.value.toUpperCase());
                  setPromoErr(null);
                }}
                placeholder="Enter code"
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
            {promoErr && (
              <p className="mt-2 text-xs font-semibold text-destructive">{promoErr}</p>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Try <b>DINEQ10</b>, <b>FLAT100</b>, or <b>FIRST50</b>.
            </p>
          </div>
        )}
      </Section>

      {/* Pay with */}
      <Section title="Pay with">
        <div className="space-y-2">
          <button className="tap flex w-full items-center gap-3 rounded-2xl border border-primary/60 bg-card p-3 text-left shadow-card">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Pay at secure gateway</p>
              <p className="text-[11px] text-muted-foreground">Card, wallet or bank</p>
            </div>
            <span className="h-4 w-4 rounded-full border-2 border-primary bg-primary ring-2 ring-card ring-offset-0" />
          </button>
          <button className="tap w-full rounded-full text-xs font-bold text-primary">
            + Add a card or wallet
          </button>
        </div>
      </Section>

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
              <Lock className="h-4 w-4" />
              <span>Pay Now · {formatRs(total)}</span>
            </>
          )}
        </motion.button>
        <p className="mt-2 pb-1 text-center text-[10px] text-muted-foreground">
          <Lock className="mr-1 inline h-3 w-3" />
          Secure payment · You're charged once · Goes directly to the kitchen.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 px-4">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
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
      <h1 className="font-display text-lg font-extrabold">Checkout</h1>
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
  active,
  onClick,
  disabled,
  label,
  sub,
  Icon,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  sub: string;
  Icon: LucideIcon;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "tap flex flex-col items-start rounded-xl px-3 py-3 text-left transition disabled:opacity-50",
        active ? "bg-background shadow-card" : "bg-transparent",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full",
          active ? "bg-primary-soft text-primary" : "bg-surface text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span
        className={cn(
          "mt-2 text-sm font-bold",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span className="text-[11px] text-muted-foreground">{sub}</span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}

function Row({
  label,
  value,
  big,
  accent,
}: {
  label: string;
  value: string;
  big?: boolean;
  accent?: "success";
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={cn(big ? "text-base font-bold" : "text-sm text-muted-foreground")}>
        {label}
      </span>
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
