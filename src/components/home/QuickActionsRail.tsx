import { categories } from "@/lib/mock/data";
import { motion } from "framer-motion";

export function QuickActionsRail() {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between px-4">
        <h2 className="font-display text-[18px] font-extrabold leading-tight tracking-tight">
          What's on your mind?
        </h2>
        <button className="text-xs font-bold text-primary">See all</button>
      </div>
      <div className="no-scrollbar overflow-x-auto">
        <div className="flex gap-3 px-4 pb-1">
          {categories.map((c, i) => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.92 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              className="tap group flex w-[72px] shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className="grid h-[72px] w-[72px] place-items-center rounded-2xl text-3xl shadow-card ring-1 ring-black/[0.03] transition group-active:shadow-pop"
                style={{ background: c.tint }}
              >
                {c.emoji}
              </span>
              <span className="text-[11.5px] font-bold tracking-tight text-foreground/90">
                {c.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
