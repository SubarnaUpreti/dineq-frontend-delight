import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, X, Mic } from "lucide-react";
import { restaurants } from "@/lib/mock/data";
import { LocationHeader } from "@/components/home/LocationHeader";
import { ServiceTabs } from "@/components/home/ServiceTabs";
import { OfferStrip } from "@/components/home/OfferStrip";
import { CollectionStrip } from "@/components/home/CollectionStrip";
import { FilterChipRow } from "@/components/home/FilterChipRow";
import { RestaurantCard } from "@/components/home/RestaurantCard";
import { RestaurantCardSkeleton } from "@/components/common/Skeletons";
import { PwaInstallPrompt } from "@/components/home/PwaInstallPrompt";
import { EmptyState } from "@/components/common/EmptyState";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DineQ — Order ahead for pickup & dine-in" },
      {
        name: "description",
        content:
          "Discover restaurants and pre-order your food. Skip the wait — pickup or dine-in across the city.",
      },
      { property: "og:title", content: "DineQ — Order ahead" },
      {
        property: "og:description",
        content: "Discover restaurants and pre-order for pickup or dine-in.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [service, setService] = useState<string>("delivery");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list = restaurants.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisines.some((c) => c.toLowerCase().includes(q)) ||
          r.tagline.toLowerCase().includes(q),
      );
    }
    if (filters.includes("top")) list = list.filter((r) => r.rating >= 4.0);
    if (filters.includes("pickup")) list = list.filter((r) => r.pickup);
    if (filters.includes("dinein")) list = list.filter((r) => r.dineIn);
    if (filters.includes("fast")) list = list.filter((r) => r.prepMinutes[1] <= 20);
    if (filters.includes("near")) list = list.slice().sort((a, b) => a.distanceKm - b.distanceKm);
    return list;
  }, [query, filters]);

  return (
    <div className="flex flex-col">
      {/* Top: location + search + service tabs */}
      <header className="safe-pt bg-background">
        <LocationHeader />
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Restaurant name or a dish…"
              className="h-12 w-full rounded-2xl border border-border bg-surface pl-11 pr-20 text-sm font-medium placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear"
                  className="tap grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <span className="h-5 w-px bg-border" />
              <button
                aria-label="Voice search"
                className="tap grid h-8 w-8 place-items-center rounded-full text-primary"
              >
                <Mic className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>
        <div className="pb-3">
          <ServiceTabs active={service} onChange={setService} />
        </div>
      </header>

      <PwaInstallPrompt />

      <section className="mt-2">
        <OfferStrip />
      </section>

      <section className="mt-6">
        <CollectionStrip />
      </section>

      {/* Sticky filter bar */}
      <div className="safe-pt sticky top-0 z-20 mt-7 -mb-1 border-b border-border bg-background/95 py-3 backdrop-blur-xl">
        <FilterChipRow
          active={filters}
          onToggle={(id) =>
            setFilters((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
          }
        />
      </div>

      <section className="mt-5">
        <div className="mb-4 flex items-baseline justify-between px-4">
          <h2 className="font-display text-[20px] font-extrabold leading-tight tracking-tight">
            {filters.length > 0 || query ? "Matching for you" : `${filtered.length} restaurants`}
          </h2>
          {(filters.length > 0 || query) && (
            <button
              onClick={() => {
                setFilters([]);
                setQuery("");
              }}
              className="text-xs font-bold text-primary"
            >
              Clear all
            </button>
          )}
        </div>
        {loading ? (
          <ul className="space-y-6 px-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i}>
                <RestaurantCardSkeleton />
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="Nothing matches"
            description="Try a different cuisine or remove a filter."
          />
        ) : (
          <ul className="space-y-6 px-4">
            {filtered.map((r) => (
              <li key={r.id}>
                <RestaurantCard r={r} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {filtered.length > 0 && !loading && (
        <div className="px-4 pb-2 pt-10 text-center">
          <p className="font-display text-[15px] font-extrabold tracking-tight text-foreground/80">
            ✦ end of the list ✦
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/80">
            {filtered.length} {filtered.length === 1 ? "place" : "places"} near you
          </p>
        </div>
      )}
    </div>
  );
}
