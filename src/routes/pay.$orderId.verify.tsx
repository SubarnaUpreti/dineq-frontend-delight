import { createFileRoute, useNavigate, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useOrders } from "@/lib/store/orders";
import { formatRs } from "@/lib/format";
import { useReducedMotion, haptic } from "@/lib/motion";

export const Route = createFileRoute("/pay/$orderId/verify")({
  head: () => ({ meta: [{ title: "Confirming payment — DineQ" }] }),
  component: VerifyPage,
});

const MESSAGES = [
  "Confirming your payment…",
  "Telling the kitchen…",
  "Preparing your order ticket…",
  "Almost done…",
];

function VerifyPage() {
  const { orderId } = Route.useParams();
  const order = useOrders((s) => s.get(orderId));
  const update = useOrders((s) => s.updateStatus);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  if (!order) throw notFound();

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(MESSAGES.length - 1, s + 1)), 900);
    const t = setTimeout(() => {
      clearInterval(id);
      update(orderId, "accepted");
      setDone(true);
      haptic(20);
      if (!reduced) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 } });
        setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } }), 200);
        setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } }), 350);
      }
    }, 3800);
    return () => { clearInterval(id); clearTimeout(t); };
  }, [orderId, update, reduced]);

  return (
    <div className="safe-pt flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative grid h-24 w-24 place-items-center rounded-full bg-primary-soft text-primary">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
            <h1 className="mt-8 font-display text-2xl font-extrabold">Hold tight</h1>
            <p className="mt-2 h-5 text-sm text-muted-foreground">
              <AnimatePresence mode="wait">
                <motion.span
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {MESSAGES[step]}
                </motion.span>
              </AnimatePresence>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex flex-col items-center text-center"
          >
            <div className="grid h-24 w-24 place-items-center rounded-full bg-success text-success-foreground shadow-pill">
              <Check className="h-12 w-12" strokeWidth={3} />
            </div>
            <h1 className="mt-8 font-display text-3xl font-extrabold">Order confirmed!</h1>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              {order.restaurantName} got your order. We paid {formatRs(order.total)} and your food
              will be ready soon.
            </p>
            <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
              <Link
                to="/orders/$id"
                params={{ id: order.id }}
                className="tap flex h-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-pill"
              >
                Track order
              </Link>
              <Link
                to="/"
                className="tap flex h-11 items-center justify-center rounded-full text-sm font-bold text-muted-foreground"
              >
                Back home
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
