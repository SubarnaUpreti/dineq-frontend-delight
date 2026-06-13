import { Link } from "@tanstack/react-router";
import { Heart, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { Restaurant } from "@/lib/mock/types";
import { RatingPill } from "@/components/common/RatingPill";
import { useFavorites } from "@/lib/store/favorites";
import { haptic } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function RestaurantCard({ r }: { r: Restaurant }) {
  const has = useFavorites((s) => s.ids.includes(r.id));
  const toggle = useFavorites((s) => s.toggle);

  return (
    <Link
      to="/restaurant/$id"
      params={{ id: r.id }}
      className="tap block overflow-hidden rounded-3xl border border-border bg-card shadow-card transition active:scale-[0.99]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        <img src={r.cover} alt={r.name} className="h-full w-full object-cover" loading="lazy" />
        {!r.open && (
          <div className="absolute inset-0 grid place-items-center bg-foreground/55">
            <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-foreground">
              Closed · Opens {r.hours.split("–")[0].trim()}
            </span>
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.preventDefault();
            haptic(10);
            toggle(r.id);
          }}
          aria-label={has ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/95 shadow-card backdrop-blur-md"
        >
          <Heart
            className={cn("h-4 w-4 transition", has ? "fill-primary text-primary" : "text-foreground")}
            strokeWidth={2.2}
          />
        </motion.button>
        <div className="absolute left-3 top-3">
          {r.pickup && r.dineIn ? (
            <Badge>Pickup · Dine-in</Badge>
          ) : r.pickup ? (
            <Badge>Pickup</Badge>
          ) : r.dineIn ? (
            <Badge>Dine-in</Badge>
          ) : null}
        </div>
      </div>
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-tight">{r.name}</h3>
          <RatingPill rating={r.rating} reviewCount={r.reviewCount} />
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{r.cuisines.join(" · ")}</p>
        <div className="mt-2.5 flex items-center gap-3 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" strokeWidth={2.2} />
            {r.prepMinutes[0]}–{r.prepMinutes[1]} min
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2.2} />
            {r.distanceKm} km
          </span>
        </div>
      </div>
    </Link>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-background/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-card backdrop-blur-md">
      {children}
    </span>
  );
}
