import { useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { BottomTabBar } from "./BottomTabBar";
import { CartPill } from "./CartPill";
import { ActiveOrderBar } from "./ActiveOrderBar";

const HIDE_NAV_PREFIXES = ["/cart", "/pay"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideNav = HIDE_NAV_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col bg-background sm:max-w-[520px] sm:my-0 sm:rounded-none">
      <main className={`flex-1 ${hideNav ? "pb-0" : "pb-[140px]"}`}>{children}</main>
      {!hideNav && (
        <>
          <ActiveOrderBar />
          <CartPill />
          <BottomTabBar />
        </>
      )}
    </div>
  );
}
