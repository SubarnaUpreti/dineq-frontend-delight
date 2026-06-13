import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function EmptyState({
  emoji,
  title,
  description,
  action,
}: {
  emoji: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto flex max-w-xs flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-primary/15 blur-2xl" aria-hidden />
        <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-primary-soft to-surface text-4xl ring-1 ring-border/60 shadow-card">
          {emoji}
        </div>
      </div>
      <h3 className="mt-6 font-display text-lg font-extrabold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
