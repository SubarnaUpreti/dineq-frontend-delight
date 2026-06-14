import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Heart, MapPin, Minus, Plus, Share2 } from "lucide-react";
import { getMenu, getRestaurant } from "@/lib/mock/data";
import { RatingPill } from "@/components/common/RatingPill";
import { DietaryBadge } from "@/components/common/DietaryBadge";
import { ItemCustomizerSheet } from "@/components/menu/ItemCustomizerSheet";
import { useFavorites } from "@/lib/store/favorites";
import { buildLineFromSelections, useCart } from "@/lib/store/cart";
import { formatRs } from "@/lib/format";
import { flyToCart } from "@/lib/fly-to-cart";
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

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
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
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-foreground/70">
            {r.cuisines.map((c: string, i: number) => (
              <span key={c} className="inline-flex items-center gap-3">
                {c}
                {i < r.cuisines.length - 1 && <span className="h-1 w-1 rounded-full bg-border" />}
              </span>
            ))}
            {(r.pickup || r.dineIn) && (
              <>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="text-foreground/60">
                  {r.pickup && r.dineIn ? "Pickup · Dine-in" : r.pickup ? "Pickup" : "Dine-in"}
                </span>
              </>
            )}
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

      {/* Menu sections — compact horizontal rows, dense + scannable */}
      <div className="space-y-6 px-4 pb-32 pt-4">
        {grouped.map(([cat, list]) => (
          <section
            key={cat}
            ref={(el) => { sectionRefs.current[cat] = el; }}
          >
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-lg font-extrabold">{cat}</h2>
              <span className="text-[11px] font-semibold text-muted-foreground">{list.length} items</span>
            </div>
            <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              {list.map((m) => (
                <MenuItemRow
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


function MenuItemRow({
  item,
  onOpen,
}: {
  item: MenuItem;
  onOpen: (triggerEl: HTMLElement) => void;
}) {
  const lines = useCart((s) => s.lines.filter((l) => l.itemId === item.id));
  const addLine = useCart((s) => s.addLine);
  const setQty = useCart((s) => s.setQty);
  const totalQty = lines.reduce((s, l) => s + l.qty, 0);
  const imgRef = useRef<HTMLImageElement>(null);

  const hasOptions =
    (item.variants && item.variants.length > 0) ||
    (item.modifierGroups && item.modifierGroups.length > 0);

  const openSheet = () => onOpen(imgRef.current as unknown as HTMLElement);

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasOptions) {
      openSheet();
      return;
    }
    const build = buildLineFromSelections(item, { modifierSelections: {}, qty: 1 });
    const res = addLine(item, build);
    if (res === "added") {
      haptic(15);
      flyToCart(imgRef.current, item.image);
    }
  };

  const inc = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasOptions) {
      // Re-open customizer so the user can vary toppings — Zomato-style "Add another"
      openSheet();
      return;
    }
    const line = lines[0];
    if (!line) return quickAdd(e);
    setQty(line.lineId, line.qty + 1);
    haptic(10);
  };

  const dec = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Decrement most recent line
    const line = lines[lines.length - 1];
    if (!line) return;
    setQty(line.lineId, line.qty - 1);
    haptic(10);
  };

  return (
    <li>
      <div className="group relative flex w-full items-stretch gap-3 p-3 transition">
        {/* Tap target for the text/details area opens the customizer/details */}
        <button
          type="button"
          onClick={openSheet}
          className="tap min-w-0 flex-1 py-0.5 text-left"
        >
          <div className="flex items-center gap-1.5">
            <DietaryBadge diet={item.diet} />
            {item.popular && (
              <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warning-foreground">
                Popular
              </span>
            )}
          </div>
          <p className="mt-1.5 line-clamp-1 text-[14px] font-bold leading-tight">{item.name}</p>
          <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
            {item.description}
          </p>
          <p className="mt-1.5 text-[14px] font-extrabold text-foreground">{formatRs(item.price)}</p>
        </button>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={openSheet}
            className="tap block h-20 w-20 overflow-hidden rounded-xl bg-surface-2"
            aria-label={`View ${item.name}`}
          >
            <img
              ref={imgRef}
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </button>

          {totalQty === 0 ? (
            <motion.button
              type="button"
              onClick={quickAdd}
              whileTap={{ scale: 0.88 }}
              className="tap absolute -bottom-2 left-1/2 z-10 inline-flex h-8 -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 text-[12px] font-extrabold uppercase tracking-wide text-primary-foreground shadow-pill ring-[3px] ring-card"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={3} />
              Add
            </motion.button>
          ) : (
            <motion.div
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="absolute -bottom-2 left-1/2 z-10 inline-flex h-8 -translate-x-1/2 items-center gap-1 rounded-full bg-primary text-primary-foreground shadow-pill ring-[3px] ring-card"
            >
              <button
                type="button"
                onClick={dec}
                aria-label="Decrease"
                className="tap grid h-8 w-8 place-items-center rounded-full active:scale-90"
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
              <span className="min-w-[14px] text-center text-[13px] font-extrabold tabular-nums">
                {totalQty}
              </span>
              <button
                type="button"
                onClick={inc}
                aria-label="Increase"
                className="tap grid h-8 w-8 place-items-center rounded-full active:scale-90"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
            </motion.div>
          )}
          {hasOptions && totalQty === 0 && (
            <span className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              Customizable
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
