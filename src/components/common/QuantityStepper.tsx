import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  variant = "solid",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "ghost";
}) {
  const h = size === "lg" ? "h-12" : size === "sm" ? "h-9" : "h-11";
  const px = size === "lg" ? "px-2" : "px-1.5";
  const text = size === "lg" ? "text-base" : "text-sm";
  return (
    <div
      className={cn(
        "tap inline-flex items-center gap-1 rounded-full",
        h,
        px,
        variant === "solid" ? "bg-surface-2 border border-border" : "bg-transparent",
      )}
    >
      <motion.button
        whileTap={{ scale: 0.85 }}
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="grid h-8 w-8 place-items-center rounded-full text-foreground disabled:opacity-40"
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" strokeWidth={2.5} />
      </motion.button>
      <span className={cn("min-w-6 text-center font-bold", text)}>{value}</span>
      <motion.button
        whileTap={{ scale: 0.85 }}
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm disabled:opacity-40"
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" strokeWidth={2.8} />
      </motion.button>
    </div>
  );
}
