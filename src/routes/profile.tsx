import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, ClipboardList, Heart, HelpCircle, LogOut, Phone, Settings, User as UserIcon } from "lucide-react";
import { useUser } from "@/lib/store/user";
import { useOrders } from "@/lib/store/orders";
import { useFavorites } from "@/lib/store/favorites";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — DineQ" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useUser((s) => s.user);
  const logout = useUser((s) => s.logout);
  const orderCount = useOrders((s) => s.orders.length);
  const favCount = useFavorites((s) => s.ids.length);

  const initials = (user.name || "G").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex flex-col">
      <header className="safe-pt px-4 pt-4">
        <h1 className="font-display text-2xl font-extrabold">Profile</h1>
      </header>

      <section className="mt-4 px-4">
        <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl font-extrabold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-extrabold">{user.name || "Guest"}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {user.phone || "Not set"}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Stat to="/orders" Icon={ClipboardList} label="Orders" value={orderCount} />
          <Stat to="/favorites" Icon={Heart} label="Favorites" value={favCount} />
        </div>
      </section>

      <section className="mt-6 px-4">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Account
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <Row Icon={UserIcon} label="Personal details" />
          <Row Icon={Settings} label="App settings" />
          <Row Icon={HelpCircle} label="Help & support" />
        </div>
      </section>

      <section className="mt-6 px-4 pb-10">
        <button
          onClick={() => { logout(); }}
          className="tap flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/8 py-3.5 text-sm font-bold text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
        <p className="mt-6 text-center text-[11px] text-muted-foreground">DineQ · v1.0.0</p>
      </section>
    </div>
  );
}

function Stat({ to, Icon, label, value }: { to: "/orders" | "/favorites"; Icon: typeof Heart; label: string; value: number }) {
  return (
    <Link to={to} className="tap rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-display text-2xl font-extrabold">{value}</span>
      </div>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </Link>
  );
}

function Row({ Icon, label }: { Icon: typeof Heart; label: string }) {
  return (
    <button className="tap flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left last:border-0">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-2 text-foreground/80">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
