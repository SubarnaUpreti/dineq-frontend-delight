import { motion } from "framer-motion";
import { SlidersHorizontal, ArrowUpDown, ChevronDown } from "lucide-react";

const FILTERS = [
  { id: "fast", label: "Fast Delivery" },
  { id: "top", label: "Rating 4.0+" },
  { id: "offers", label: "Offers" },
  { id: "pickup", label: "Pickup" },
  { id: "dinein", label: "Dine-in" },
  { id: "near", label: "Nearest" },
];

export function FilterChipRow({
  active,
  onToggle,
}: {
  active: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="no-scrollbar overflow-x-auto">
      <div className="flex gap-2 px-4">
        <button className="tap inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 text-xs font-bold text-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.4} />
          Filters
        </button>
        <button className="tap inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-border bg-surface px-3.5 text-xs font-bold text-foreground">
          <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={2.4} />
          Sort
          <ChevronDown className="h-3 w-3" strokeWidth={2.6} />
        </button>
        <span className="my-auto h-5 w-px shrink-0 bg-border" />
        {FILTERS.map((f) => {
          const isActive = active.includes(f.id);
          return (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => onToggle(f.id)}
              className={`tap inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-xs font-bold transition ${
                isActive
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface text-foreground"
              }`}
            >
              {f.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
