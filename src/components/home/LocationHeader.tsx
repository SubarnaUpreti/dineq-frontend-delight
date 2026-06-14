import { ChevronDown, MapPin, Bell } from "lucide-react";
import { useUser } from "@/lib/store/user";

export function LocationHeader() {
  const user = useUser((s) => s.user);
  return (
    <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-1">
      <button className="tap flex min-w-0 items-start gap-2 text-left">
        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <MapPin className="h-3 w-3" strokeWidth={2.6} fill="currentColor" />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1">
            <span className="font-display text-[15px] font-extrabold leading-none tracking-tight">
              Home
            </span>
            <ChevronDown className="h-4 w-4 text-foreground" strokeWidth={2.4} />
          </span>
          <span className="mt-1 block truncate text-[11.5px] text-muted-foreground">
            221B Baker Street, Lazimpat
          </span>
        </span>
      </button>
      <div className="flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="tap relative grid h-10 w-10 place-items-center rounded-full bg-surface-2"
        >
          <Bell className="h-5 w-5 text-foreground" strokeWidth={2.2} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
          {(user.name?.[0] || "G").toUpperCase()}
        </div>
      </div>
    </div>
  );
}
