import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/store/favorites";
import { restaurants } from "@/lib/mock/data";
import { RestaurantCard } from "@/components/home/RestaurantCard";
import { EmptyState } from "@/components/common/EmptyState";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Saved — DineQ" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const ids = useFavorites((s) => s.ids);
  const list = restaurants.filter((r) => ids.includes(r.id));

  return (
    <div className="flex flex-col">
      <header className="safe-pt sticky top-0 z-20 bg-background/85 px-4 pb-3 pt-4 backdrop-blur-xl">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold">Saved</h1>
            <p className="text-xs text-muted-foreground">Your saved restaurants, always at hand.</p>
          </div>
          {list.length > 0 && (
            <span className="inline-flex h-7 items-center gap-1 rounded-full bg-primary-soft px-2.5 text-[11px] font-bold text-primary">
              <Heart className="h-3 w-3 fill-primary" />
              {list.length}
            </span>
          )}
        </div>
      </header>
      <div className="px-4 pt-3">
        {list.length === 0 ? (
          <EmptyState
            emoji="🤍"
            title="Nothing saved yet"
            description="Tap the heart on any restaurant to keep it here for quick re-ordering."
            action={
              <Link
                to="/"
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-pill"
              >
                Discover restaurants
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3.5">
            {list.map((r) => (
              <li key={r.id}>
                <RestaurantCard r={r} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

