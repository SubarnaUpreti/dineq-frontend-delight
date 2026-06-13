import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatRs } from "@/lib/format";

export function CartPill() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const count = useCart((s) => s.itemCount());
  const subtotal = useCart((s) => s.subtotal());
  const visible = count > 0 && !pathname.startsWith("/cart") && !pathname.startsWith("/pay");

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[84px] z-30 mx-auto flex w-full max-w-[480px] justify-center px-4 sm:max-w-[520px]">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto w-full"
            id="cart-pill-target"
          >
            <Link
              to="/cart"
              className="tap flex h-14 w-full items-center gap-3 rounded-full bg-foreground px-5 text-background shadow-pill"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
                <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <span className="flex-1 text-left">
                <span className="block text-[11px] font-medium uppercase tracking-wider opacity-70">
                  {count} {count === 1 ? "item" : "items"} · {formatRs(subtotal)}
                </span>
                <span className="block text-sm font-bold">View cart</span>
              </span>
              <ChevronRight className="h-5 w-5 opacity-80" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
