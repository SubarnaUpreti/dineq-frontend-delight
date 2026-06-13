import { motion } from "framer-motion";

const FILTERS = [
  { id: "near", label: "Near me", emoji: "📍" },
  { id: "top", label: "Rated 4.5+", emoji: "⭐" },
  { id: "pickup", label: "Pickup", emoji: "🛍️" },
  { id: "dinein", label: "Dine-in", emoji: "🪑" },
  { id: "open", label: "Open now", emoji: "🟢" },
  { id: "fast", label: "Fast prep", emoji: "⚡" },
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
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-surface text-foreground"
              }`}
            >
              <span>{f.emoji}</span>
              {f.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
