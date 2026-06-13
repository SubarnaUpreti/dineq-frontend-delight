import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bike, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { getActiveOrders, useOrders } from "@/lib/store/orders";
import { useCart } from "@/lib/store/cart";

const STATUS_LABEL: Record<string, string> = {
  placed: "Order placed",
  accepted: "Restaurant accepted",
  preparing: "Preparing your order",
  ready: "Ready for pickup",
};

export function ActiveOrderBar() {
  const orders = useOrders((s) => s.orders);
  const active = useMemo(() => getActiveOrders(orders), [orders]);
  const cartCount = useCart((s) => s.itemCount());
  const order = active[0];
  // If cart pill is visible, push the active order bar up
  const bottomOffset = cartCount > 0 ? 152 : 84;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-30 mx-auto flex w-full max-w-[480px] justify-center px-4 sm:max-w-[520px]"
      style={{ bottom: `${bottomOffset}px` }}
    >
      <AnimatePresence>
        {order && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="pointer-events-auto w-full"
          >
            <Link
              to="/orders/$id"
              params={{ id: order.id }}
              className="tap flex h-14 w-full items-center gap-3 rounded-full bg-success px-4 text-success-foreground shadow-pill"
            >
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white/15">
                <Bike className="h-4 w-4" />
                <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
              </span>
              <span className="flex-1 text-left leading-tight">
                <span className="block text-[11px] font-medium uppercase tracking-wider opacity-90">
                  {order.restaurantName}
                </span>
                <span className="block text-sm font-bold">
                  {STATUS_LABEL[order.status] ?? "In progress"}
                </span>
              </span>
              <span className="text-xs font-semibold">Track</span>
              <ChevronRight className="h-5 w-5 opacity-90" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
