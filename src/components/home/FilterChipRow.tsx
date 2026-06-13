import { motion } from "framer-motion";
import { MapPin, Star, ShoppingBag, Utensils, Circle, Zap } from "lucide-react";

const FILTERS = [
  { id: "near", label: "Near me", Icon: MapPin },
  { id: "top", label: "Top rated", Icon: Star },
  { id: "open", label: "Open now", Icon: Circle },
  { id: "fast", label: "Under 15 min", Icon: Zap },
  { id: "pickup", label: "Pickup", Icon: ShoppingBag },
  { id: "dinein", label: "Dine-in", Icon: Utensils },
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
        {FILTERS.map((f) => {
          const isActive = active.includes(f.id);
          return (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => onToggle(f.id)}
              className={`tap inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition ${
                isActive
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-border bg-surface text-foreground"
              }`}
            >
              <f.Icon
                className={`h-3.5 w-3.5 ${
                  f.id === "open" ? "fill-success text-success" : ""
                }`}
                strokeWidth={2.2}
              />
              {f.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
