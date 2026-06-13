import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Heart, MapPin, Plus, Share2 } from "lucide-react";
import { getMenu, getRestaurant } from "@/lib/mock/data";
import { RatingPill } from "@/components/common/RatingPill";
import { DietaryBadge } from "@/components/common/DietaryBadge";
import { ItemCustomizerSheet } from "@/components/menu/ItemCustomizerSheet";
import { useFavorites } from "@/lib/store/favorites";
import { useCart } from "@/lib/store/cart";
import { formatRs } from "@/lib/format";
import { haptic } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/mock/types";

export const Route = createFileRoute("/restaurant/$id")({
  loader: ({ params }) => {
    const r = getRestaurant(params.id);
    if (!r) throw notFound();
    return { restaurant: r };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.restaurant.name} — DineQ` },
          { name: "description", content: loaderData.restaurant.tagline },
          { property: "og:title", content: `${loaderData.restaurant.name} on DineQ` },
          { property: "og:description", content: loaderData.restaurant.tagline },
          { property: "og:image", content: loaderData.restaurant.cover },
        ]
      : [],
  }),
  component: RestaurantPage,
});

function RestaurantPage() {
  const { restaurant: r } = Route.useLoaderData();
  const menu = useMemo(() => getMenu(r.id), [r.id]);
  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const cat of r.categories) map.set(cat, []);
    for (const m of menu) {
      if (m.category === "Popular" || m.popular) {
        const cur = map.get("Popular") ?? [];
        if (!cur.includes(m)) map.set("Popular", [...cur, m]);
      }
      const cur = map.get(m.category) ?? [];
      if (!cur.includes(m)) map.set(m.category, [...cur, m]);
    }
    return Array.from(map.entries()).filter(([, list]) => list.length > 0);
  }, [menu, r.categories]);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [active, setActive] = useState(grouped[0]?.[0] ?? "");
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);

  const favHas = useFavorites((s) => s.ids.includes(r.id));
  const favToggle = useFavorites((s) => s.toggle);

  const scrollTo = (cat: string) => {
    const el = sectionRefs.current[cat];
    if (!el) return;
    setActive(cat);
    const y = el.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col bg-surface-2/60">
      {/* Cover */}
      <div className="relative h-64 w-full overflow-hidden bg-surface-2">
        <img src={r.cover} alt={r.name} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="safe-pt absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3">
          <Link
            to="/"
            className="tap grid h-10 w-10 place-items-center rounded-full bg-background/95 text-foreground shadow-card backdrop-blur-md"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex gap-2">
            <button
              className="tap grid h-10 w-10 place-items-center rounded-full bg-background/95 text-foreground shadow-card backdrop-blur-md"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => { haptic(10); favToggle(r.id); }}
              className="tap grid h-10 w-10 place-items-center rounded-full bg-background/95 shadow-card backdrop-blur-md"
              aria-label="Favorite"
            >
              <Heart
                className={cn("h-4 w-4", favHas ? "fill-primary text-primary" : "text-foreground")}
              />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Header card */}
      <div className="relative -mt-16 px-4">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-start gap-3">
            <img
              src={r.logo}
              alt=""
              className="h-14 w-14 shrink-0 rounded-2xl border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xl font-extrabold leading-tight">{r.name}</h1>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{r.tagline}</p>
            </div>
            <RatingPill rating={r.rating} reviewCount={r.reviewCount} size="md" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {r.prepMinutes[0]}–{r.prepMinutes[1]} min
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {r.distanceKm} km
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 font-semibold",
                r.open ? "text-success" : "text-destructive",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", r.open ? "bg-success" : "bg-destructive")} />
              {r.open ? "Open now" : "Closed"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {r.cuisines.map((c) => (
              <span
                key={c}
                className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-foreground/70"
              >
                {c}
              </span>
            ))}
            {r.pickup && <Tag color="success">Pickup</Tag>}
            {r.dineIn && <Tag color="info">Dine-in</Tag>}
          </div>
        </div>
      </div>

      {/* Sticky category nav */}
      <div className="safe-pt sticky top-0 z-20 mt-5 bg-background/90 backdrop-blur-xl">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2.5">
          {grouped.map(([cat]) => (
            <button
              key={cat}
              onClick={() => scrollTo(cat)}
              className={cn(
                "tap h-9 shrink-0 rounded-full px-3.5 text-xs font-bold transition",
                active === cat
                  ? "bg-foreground text-background"
                  : "bg-surface text-foreground/80 ring-1 ring-border",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu sections */}
      <div className="space-y-7 px-4 pb-12 pt-4">
        {grouped.map(([cat, list]) => (
          <section
            key={cat}
            ref={(el) => { sectionRefs.current[cat] = el; }}
          >
            <h2 className="mb-3 font-display text-lg font-extrabold">{cat}</h2>
            <ul className="grid grid-cols-2 gap-3">
              {list.map((m) => (
                <MenuItemCard
                  key={m.id + cat}
                  item={m}
                  onOpen={(el) => {
                    setTriggerEl(el);
                    setSheetItem(m);
                  }}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <ItemCustomizerSheet
        item={sheetItem}
        open={!!sheetItem}
        onOpenChange={(v) => !v && setSheetItem(null)}
        triggerElement={triggerEl}
      />
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: "success" | "info" }) {
  const cls =
    color === "success" ? "bg-success/12 text-success" : "bg-primary-soft text-primary";
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider", cls)}>
      {children}
    </span>
  );
}

function MenuItemCard({
  item,
  onOpen,
}: {
  item: MenuItem;
  onOpen: (triggerEl: HTMLElement) => void;
}) {
  const inCart = useCart((s) => s.lines.some((l) => l.itemId === item.id));
  const ref = useRef<HTMLImageElement>(null);
  const handleClick = () => {
    onOpen(ref.current as unknown as HTMLElement);
  };
  return (
    <li>
      <button
        onClick={handleClick}
        className="tap group block w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-card transition active:scale-[0.98]"
      >
        <div className="relative aspect-square overflow-hidden bg-surface-2">
          <img
            ref={ref}
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute left-2 top-2">
            <DietaryBadge diet={item.diet} />
          </div>
          {item.popular && (
            <span className="absolute right-2 top-2 rounded-full bg-warning px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning-foreground">
              Popular
            </span>
          )}
          <motion.span
            whileTap={{ scale: 0.85 }}
            className={cn(
              "absolute -bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full shadow-pill ring-4 ring-card transition",
              inCart ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground",
            )}
            aria-hidden
          >
            <Plus className="h-4 w-4" strokeWidth={2.8} />
          </motion.span>
        </div>
        <div className="p-3 pt-4">
          <p className="line-clamp-1 text-[13px] font-bold leading-tight">{item.name}</p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
            {item.description}
          </p>
          <p className="mt-2 text-sm font-extrabold text-foreground">{formatRs(item.price)}</p>
        </div>
      </button>
    </li>
  );
}
