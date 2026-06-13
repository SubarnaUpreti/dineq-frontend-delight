import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingPill({
  rating,
  reviewCount,
  size = "sm",
  className,
}: {
  rating: number;
  reviewCount?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const h = size === "md" ? "h-7 px-2.5 text-sm" : size === "xs" ? "h-5 px-1.5 text-[11px]" : "h-6 px-2 text-xs";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-foreground/[0.04] font-bold text-foreground tabular-nums",
        h,
        className,
      )}
    >
      <Star className="h-3 w-3 fill-success text-success" strokeWidth={0} />
      {rating.toFixed(1)}
      {reviewCount !== undefined && (
        <span className="ml-0.5 font-medium text-muted-foreground">
          ({reviewCount > 999 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
        </span>
      )}
    </span>
  );
}
