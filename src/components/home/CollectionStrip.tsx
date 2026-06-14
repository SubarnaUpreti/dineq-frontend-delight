import { ChevronRight } from "lucide-react";

const COLLECTIONS = [
  {
    id: "trending",
    title: "Trending\nthis week",
    count: 24,
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=800&fit=crop&auto=format&q=80",
    tint: "linear-gradient(180deg, transparent 30%, oklch(0.2 0.1 25 / 0.8) 100%)",
  },
  {
    id: "newly",
    title: "Newly\nopened",
    count: 12,
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=800&fit=crop&auto=format&q=80",
    tint: "linear-gradient(180deg, transparent 30%, oklch(0.2 0.08 300 / 0.8) 100%)",
  },
  {
    id: "veg",
    title: "Pure veg\nrestaurants",
    count: 31,
    img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=800&fit=crop&auto=format&q=80",
    tint: "linear-gradient(180deg, transparent 30%, oklch(0.22 0.1 150 / 0.8) 100%)",
  },
  {
    id: "premium",
    title: "Premium\nout",
    count: 18,
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=800&fit=crop&auto=format&q=80",
    tint: "linear-gradient(180deg, transparent 30%, oklch(0.18 0.05 40 / 0.85) 100%)",
  },
  {
    id: "late",
    title: "Late\nnight",
    count: 9,
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=800&fit=crop&auto=format&q=80",
    tint: "linear-gradient(180deg, transparent 30%, oklch(0.18 0.06 280 / 0.85) 100%)",
  },
];

export function CollectionStrip() {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between px-4">
        <div>
          <h2 className="font-display text-[18px] font-extrabold leading-tight">
            Collections
          </h2>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Curated lists of the best spots in town
          </p>
        </div>
        <button className="inline-flex items-center gap-0.5 text-xs font-bold text-primary">
          All <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.6} />
        </button>
      </div>
      <div className="no-scrollbar overflow-x-auto">
        <div className="flex gap-3 px-4">
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              className="tap relative h-44 w-32 shrink-0 overflow-hidden rounded-2xl shadow-card"
            >
              <img
                src={c.img}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: c.tint }} />
              <div className="relative flex h-full flex-col justify-end p-3 text-white">
                <h3 className="whitespace-pre-line font-display text-[15px] font-extrabold leading-[1.05] tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-1 inline-flex items-center gap-0.5 text-[10.5px] font-semibold opacity-90">
                  {c.count} Places <ChevronRight className="h-3 w-3" strokeWidth={2.6} />
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
