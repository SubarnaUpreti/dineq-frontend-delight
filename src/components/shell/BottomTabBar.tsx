import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, ShoppingBag, Heart, User } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/store/cart";

type Tab = {
  to: "/" | "/orders" | "/cart" | "/favorites" | "/profile";
  label: string;
  Icon: typeof Home;
  match: (p: string) => boolean;
};

const tabs: Tab[] = [
  { to: "/", label: "Home", Icon: Home, match: (p) => p === "/" || p.startsWith("/restaurant") },
  { to: "/orders", label: "Orders", Icon: ClipboardList, match: (p) => p.startsWith("/orders") },
  { to: "/cart", label: "Cart", Icon: ShoppingBag, match: (p) => p.startsWith("/cart") },
  { to: "/favorites", label: "Favorites", Icon: Heart, match: (p) => p.startsWith("/favorites") },
  { to: "/profile", label: "Profile", Icon: User, match: (p) => p.startsWith("/profile") },
];

export function BottomTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const count = useCart((s) => s.itemCount());

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] safe-pb sm:max-w-[520px]"
    >
      <div className="mx-3 mb-3 rounded-3xl border border-border/70 bg-surface/95 px-2 py-1.5 shadow-pop backdrop-blur-xl">
        <ul className="flex items-stretch justify-between">
          {tabs.map(({ to, label, Icon, match }) => {
            const active = match(pathname);
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className="tap relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl"
                >
                  <motion.span
                    whileTap={{ scale: 0.88 }}
                    className="relative flex h-7 w-7 items-center justify-center"
                  >
                    <Icon
                      className={`h-[22px] w-[22px] transition-colors ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                      strokeWidth={active ? 2.6 : 2}
                      fill={active ? "currentColor" : "none"}
                      fillOpacity={active ? 0.18 : 0}
                    />
                    {to === "/cart" && count > 0 && (
                      <span className="absolute -right-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </motion.span>
                  <span
                    className={`text-[10.5px] font-semibold tracking-wide transition-colors ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="tab-dot"
                      className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
