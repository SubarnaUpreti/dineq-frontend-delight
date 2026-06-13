import { Skeleton } from "@/components/ui/skeleton";

export function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function MenuRowSkeleton() {
  return (
    <div className="flex items-stretch gap-3 p-3">
      <div className="min-w-0 flex-1 space-y-2 py-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
      <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}
