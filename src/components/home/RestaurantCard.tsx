import { Link } from "@tanstack/react-router";
import { Heart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { Restaurant } from "@/lib/mock/types";
import { RatingPill } from "@/components/common/RatingPill";
import { useFavorites } from "@/lib/store/favorites";
import { haptic } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Deterministic per-restaurant offer so the same place keeps the same banner.
function offerFor(id: string): { off: string; above: string } | null {
  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const variants = [
    { off: "60% OFF", above: "up to ₹120" },
    { off: "₹125 OFF", above: "above ₹249" },
    { off: "50% OFF", above: "up to ₹100" },
    { off: "FLAT ₹75 OFF", above: "above ₹199" },
    null,
  ];
  return variants[seed % variants.length];
}

function priceForTwo(id: string) {
  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return 250 + (seed % 9) * 50;
}

export function RestaurantCard({ r }: { r: Restaurant }) {
  const has = useFavorites((s) => s.ids.includes(r.id));
  const toggle = useFavorites((s) => s.toggle);
  const offer = offerFor(r.id);
  const eta = `${r.prepMinutes[0]}–${r.prepMinutes[1]} min`;
  const p2 = priceForTwo(r.id);

  return (
    <Link
      to="/restaurant/$id"
      params={{ id: r.id }}
      className="tap block transition active:scale-[0.99]"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-surface-2 shadow-card">
        <img src={r.cover} alt={r.name} className="h-full w-full object-cover" loading="lazy" />

        {/* Bottom gradient for legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

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
            className={cn(
              "h-4 w-4 transition",
              has ? "fill-primary text-primary" : "text-foreground",
            )}
            strokeWidth={2.2}
          />
        </motion.button>

        {/* Offer banner */}
        {offer && r.open && (
          <div className="absolute bottom-3 left-3 text-white drop-shadow">
            <p className="font-display text-[22px] font-black leading-none tracking-tight">
              {offer.off}
            </p>
            <p className="text-[10.5px] font-bold uppercase tracking-wider opacity-95">
              {offer.above}
            </p>
          </div>
        )}
      </div>

      <div className="px-1 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate font-display text-[17px] font-extrabold leading-tight">
            {r.name}
          </h3>
          <RatingPill rating={r.rating} className="bg-success text-white" />
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-[12.5px] text-muted-foreground">
          <p className="truncate">{r.cuisines.join(", ")}</p>
          <p className="shrink-0 font-semibold">₹{p2} for two</p>
        </div>
        <div className="my-2.5 h-px w-full border-t border-dashed border-border" />
        <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground/80">
          <Clock className="h-3.5 w-3.5 text-success" strokeWidth={2.6} />
          {eta}
          <span className="text-muted-foreground/70">·</span>
          <span className="text-muted-foreground">{r.distanceKm} km away</span>
          {r.pickup && (
            <>
              <span className="text-muted-foreground/70">·</span>
              <span className="text-primary">Pickup</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
