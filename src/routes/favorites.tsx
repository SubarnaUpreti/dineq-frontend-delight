import { createFileRoute, Link } from "@tanstack/react-router";
import { useFavorites } from "@/lib/store/favorites";
import { restaurants } from "@/lib/mock/data";
import { RestaurantCard } from "@/components/home/RestaurantCard";
import { EmptyState } from "@/components/common/EmptyState";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Favorites — DineQ" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const ids = useFavorites((s) => s.ids);
  const list = restaurants.filter((r) => ids.includes(r.id));

  return (
    <div className="flex flex-col">
      <header className="safe-pt sticky top-0 z-20 bg-background/85 px-4 pb-3 pt-4 backdrop-blur-xl">
        <h1 className="font-display text-2xl font-extrabold">Favorites</h1>
        <p className="text-xs text-muted-foreground">Your saved restaurants, always at hand.</p>
      </header>
      <div className="px-4 pt-3">
        {list.length === 0 ? (
          <EmptyState
            emoji="💛"
            title="No favorites yet"
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
