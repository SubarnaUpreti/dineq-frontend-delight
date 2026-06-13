import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, Heart, User } from "lucide-react";
import { motion } from "framer-motion";

type Tab = {
  to: "/" | "/orders" | "/favorites" | "/profile";
  label: string;
  Icon: typeof Home;
  match: (p: string) => boolean;
};

const tabs: Tab[] = [
  { to: "/", label: "Home", Icon: Home, match: (p) => p === "/" || p.startsWith("/restaurant") },
  { to: "/orders", label: "Orders", Icon: ClipboardList, match: (p) => p.startsWith("/orders") },
  { to: "/favorites", label: "Saved", Icon: Heart, match: (p) => p.startsWith("/favorites") },
  { to: "/profile", label: "Profile", Icon: User, match: (p) => p.startsWith("/profile") },
];

export function BottomTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] safe-pb sm:max-w-[520px]"
    >
      <div className="mx-3 mb-3 rounded-3xl border border-border/70 bg-surface/90 px-2 py-1.5 shadow-pop backdrop-blur-xl">
        <ul className="flex items-stretch justify-between">
          {tabs.map(({ to, label, Icon, match }) => {
            const active = match(pathname);
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className="tap relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl"
                >
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-1 -z-0 rounded-2xl bg-primary-soft/70"
                      transition={{ type: "spring", stiffness: 500, damping: 36 }}
                    />
                  )}
                  <motion.span
                    whileTap={{ scale: 0.88 }}
                    className="relative z-10 flex h-7 w-7 items-center justify-center"
                  >
                    <Icon
                      className={`h-[22px] w-[22px] transition-colors ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                      strokeWidth={active ? 2.6 : 2}
                      fill={active ? "currentColor" : "none"}
                      fillOpacity={active ? 0.18 : 0}
                    />
                  </motion.span>
                  <span
                    className={`relative z-10 text-[10.5px] font-semibold tracking-wide transition-colors ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
