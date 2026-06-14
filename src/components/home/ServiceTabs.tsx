import { motion } from "framer-motion";

const TABS = [
  { id: "delivery", label: "Delivery", emoji: "🛵" },
  { id: "dining", label: "Dining Out", emoji: "🍽️" },
  { id: "nightlife", label: "Nightlife", emoji: "🍸" },
] as const;

export function ServiceTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="no-scrollbar overflow-x-auto px-4">
      <div className="flex gap-2">
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => onChange(t.id)}
              className={`tap relative flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-bold transition ${
                isActive
                  ? "border-transparent bg-foreground text-background shadow-card"
                  : "border-border bg-surface text-foreground"
              }`}
            >
              <span className="text-base leading-none">{t.emoji}</span>
              {t.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
