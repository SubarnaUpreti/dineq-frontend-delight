import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { restaurants, categories } from "@/lib/mock/data";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { FilterChipRow } from "@/components/home/FilterChipRow";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { RestaurantCard } from "@/components/home/RestaurantCard";
import { PwaInstallPrompt } from "@/components/home/PwaInstallPrompt";
import { EmptyState } from "@/components/common/EmptyState";
import { useUser } from "@/lib/store/user";

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
  const [category, setCategory] = useState<string | null>(null);
  const user = useUser((s) => s.user);

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
    if (category) {
      const label = categories.find((c) => c.id === category)?.label.toLowerCase();
      if (label) {
        list = list.filter(
          (r) =>
            r.cuisines.some((c) => c.toLowerCase().includes(label)) ||
            r.name.toLowerCase().includes(label),
        );
      }
    }
    if (filters.includes("top")) list = list.filter((r) => r.rating >= 4.5);
    if (filters.includes("pickup")) list = list.filter((r) => r.pickup);
    if (filters.includes("dinein")) list = list.filter((r) => r.dineIn);
    if (filters.includes("open")) list = list.filter((r) => r.open);
    if (filters.includes("fast")) list = list.filter((r) => r.prepMinutes[1] <= 15);
    if (filters.includes("near")) list = list.slice().sort((a, b) => a.distanceKm - b.distanceKm);
    return list;
  }, [query, filters, category]);

  return (
    <div className="flex flex-col">
      {/* Sticky search header */}
      <header className="safe-pt sticky top-0 z-20 bg-background/85 backdrop-blur-xl">
        <div className="px-4 pb-2 pt-3">
          <div className="flex items-center justify-between gap-3 pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Hi {user.name?.split(" ")[0] || "there"} 👋
              </p>
              <h1 className="font-display text-[22px] font-extrabold leading-tight">
                What sounds good?
              </h1>
            </div>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search momo, pizza, cafe…"
              className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-11 text-sm font-medium placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear"
                className="tap absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-surface-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <PwaInstallPrompt />

      <section className="mt-4">
        <PromoCarousel />
      </section>

      <section className="mt-5">
        <FilterChipRow
          active={filters}
          onToggle={(id) =>
            setFilters((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
          }
        />
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-baseline justify-between px-4">
          <h2 className="font-display text-base font-bold">Browse by craving</h2>
          {category && (
            <button
              onClick={() => setCategory(null)}
              className="text-xs font-semibold text-primary"
            >
              Clear
            </button>
          )}
        </div>
        <CategoryGrid active={category} onSelect={setCategory} />
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-baseline justify-between px-4">
          <h2 className="font-display text-base font-bold">
            {filters.length > 0 || category || query ? "Matching for you" : "Popular near you"}
          </h2>
          <span className="text-xs text-muted-foreground">{filtered.length} places</span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="Nothing matches"
            description="Try a different cuisine or remove a filter."
          />
        ) : (
          <ul className="space-y-3.5 px-4">
            {filtered.map((r) => (
              <li key={r.id}>
                <RestaurantCard r={r} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {filtered.length > 0 && (
        <div className="px-4 pb-2 pt-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            You're all caught up
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/80">
            {filtered.length} {filtered.length === 1 ? "place" : "places"} near you
          </p>
        </div>
      )}
    </div>
  );
}
