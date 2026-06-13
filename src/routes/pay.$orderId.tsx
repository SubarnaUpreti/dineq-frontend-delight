import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Smartphone, CreditCard, Wallet } from "lucide-react";
import { useOrders } from "@/lib/store/orders";
import { formatRs } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pay/$orderId")({
  head: () => ({ meta: [{ title: "Pay — DineQ" }] }),
  component: PayPage,
});

const METHODS = [
  { id: "wallet", name: "Digital Wallet", sub: "Pay from your linked wallet", Icon: Wallet, color: "oklch(0.55 0.18 250)" },
  { id: "qr", name: "Scan & Pay", sub: "Open your banking app", Icon: Smartphone, color: "oklch(0.62 0.15 150)" },
  { id: "card", name: "Card", sub: "Visa, Mastercard, Amex", Icon: CreditCard, color: "oklch(0.65 0.18 30)" },
];

function PayPage() {
  const { orderId } = Route.useParams();
  const order = useOrders((s) => s.get(orderId));
  const navigate = useNavigate();
  const [method, setMethod] = useState("wallet");

  if (!order) throw notFound();

  const pay = () => navigate({ to: "/pay/$orderId/verify", params: { orderId } });

  return (
    <div className="safe-pt flex min-h-[100dvh] flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-3">
        <Link to="/cart" className="tap grid h-10 w-10 place-items-center rounded-full bg-surface shadow-card">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-3 py-1 text-[11px] font-bold text-success">
          <Lock className="h-3 w-3" /> Secure payment
        </span>
        <div className="w-10" />
      </header>

      {/* Merchant */}
      <div className="mx-4 mt-3 rounded-3xl bg-foreground p-6 text-background shadow-pop">
        <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Paying to</p>
        <p className="mt-1 font-display text-lg font-extrabold">{order.restaurantName}</p>
        <p className="mt-0.5 text-xs opacity-80">Order {order.number}</p>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider opacity-70">Amount</p>
        <p className="font-display text-4xl font-extrabold">{formatRs(order.total)}</p>
      </div>

      <section className="mt-6 px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Choose a payment method
        </h2>
        <ul className="space-y-2">
          {METHODS.map((m) => {
            const active = method === m.id;
            return (
              <li key={m.id}>
                <button
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "tap flex w-full items-center gap-3 rounded-2xl border bg-card p-3.5 text-left shadow-card transition",
                    active ? "border-primary ring-2 ring-primary/30" : "border-border",
                  )}
                >
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl text-white"
                    style={{ background: m.color }}
                  >
                    <m.Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground">{m.sub}</p>
                  </div>
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-full border-[1.5px]",
                      active ? "border-primary bg-primary" : "border-border",
                    )}
                  >
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="safe-pb mt-auto px-4 pt-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={pay}
          className="tap flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-pill"
        >
          Pay {formatRs(order.total)}
        </motion.button>
        <button
          onClick={() => navigate({ to: "/cart" })}
          className="mt-3 block w-full py-2 text-center text-xs font-bold text-muted-foreground"
        >
          Cancel payment
        </button>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          This is a demo gateway. No real payment is processed.
        </p>
      </div>
    </div>
  );
}
