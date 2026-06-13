import { useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { BottomTabBar } from "./BottomTabBar";
import { CartPill } from "./CartPill";
import { ActiveOrderBar } from "./ActiveOrderBar";
import { FlyToCartLayer } from "@/components/common/FlyToCartLayer";
import { CartConflictDialog } from "@/components/menu/CartConflictDialog";

const HIDE_NAV_PREFIXES = ["/cart", "/pay"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideNav = HIDE_NAV_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col bg-background shadow-[0_0_60px_oklch(0.5_0.05_60/0.08)] sm:max-w-[520px]">
      <main className={`flex-1 ${hideNav ? "pb-0" : "pb-[140px]"}`}>{children}</main>
      {!hideNav && (
        <>
          <ActiveOrderBar />
          <CartPill />
          <BottomTabBar />
        </>
      )}
      <FlyToCartLayer />
      <CartConflictDialog />
    </div>
  );
}
