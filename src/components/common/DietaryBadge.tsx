import { cn } from "@/lib/utils";
import type { Diet } from "@/lib/mock/types";

const STYLE: Record<Diet, { ring: string; dot: string; label: string }> = {
  veg: { ring: "border-veg", dot: "bg-veg", label: "Veg" },
  nonveg: { ring: "border-nonveg", dot: "bg-nonveg", label: "Non-veg" },
  egg: { ring: "border-egg", dot: "bg-egg", label: "Egg" },
};

export function DietaryBadge({
  diet,
  size = "md",
  withLabel = false,
  className,
}: {
  diet: Diet;
  size?: "sm" | "md";
  withLabel?: boolean;
  className?: string;
}) {
  const s = STYLE[diet];
  const box = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const dot = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        aria-label={s.label}
        className={cn("grid place-items-center rounded-[3px] border-[1.5px] bg-white", box, s.ring)}
      >
        <span className={cn("rounded-full", dot, s.dot)} />
      </span>
      {withLabel && <span className="text-[11px] font-semibold text-muted-foreground">{s.label}</span>}
    </span>
  );
}
