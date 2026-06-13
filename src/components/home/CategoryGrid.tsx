import { motion } from "framer-motion";
import { categories } from "@/lib/mock/data";

export function CategoryGrid({
  active,
  onSelect,
}: {
  active: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-3 px-4">
      {categories.map((c) => {
        const isActive = active === c.id;
        return (
          <motion.button
            key={c.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(isActive ? null : c.id)}
            className={`tap flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border transition ${
              isActive ? "border-primary ring-2 ring-primary/30" : "border-border"
            }`}
            style={{ background: c.tint }}
          >
            <span className="text-2xl">{c.emoji}</span>
            <span className="text-[11px] font-semibold text-foreground/85">{c.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
