import { Link } from "@tanstack/react-router";
import { Star, Clock, Bike } from "lucide-react";
import { motion } from "framer-motion";
import { restaurants } from "@/lib/mock/data";

export function FeaturedHero() {
  const r = restaurants.find((x) => x.open) ?? restaurants[0];
  if (!r) return null;
  return (
    <div className="px-4">
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-[18px] font-extrabold leading-tight tracking-tight">
            Top pick for tonight
          </h2>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Hand-picked by our food editors
          </p>
        </div>
      </div>
      <Link
        to="/restaurant/$id"
        params={{ id: r.id }}
        className="tap block overflow-hidden rounded-3xl shadow-card"
      >
        <motion.div
          whileTap={{ scale: 0.99 }}
          className="relative aspect-[16/10] overflow-hidden bg-surface-2"
        >
          <img
            src={r.cover}
            alt={r.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-warning px-2 py-1 text-[10px] font-black uppercase tracking-wider text-warning-foreground shadow-card">
            ✦ Editor's pick
          </span>
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">
              {r.cuisines.join(" · ")}
            </p>
            <h3 className="mt-1 font-display text-[26px] font-black leading-[1.05] tracking-tight">
              {r.name}
            </h3>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[12px] font-bold">
              <span className="inline-flex items-center gap-1 rounded-md bg-success px-1.5 py-0.5 tabular-nums">
                <Star className="h-3 w-3 fill-white" strokeWidth={0} />
                {r.rating.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 backdrop-blur">
                <Clock className="h-3 w-3" strokeWidth={2.6} />
                {r.prepMinutes[0]}–{r.prepMinutes[1]} min
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 backdrop-blur">
                <Bike className="h-3 w-3" strokeWidth={2.6} />
                Free delivery
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
