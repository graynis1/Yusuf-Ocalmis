import { cn } from "@/lib/utils";

/** Yükleme iskeleti — algılanan hız için. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--border)]/70",
        className
      )}
    />
  );
}

/** Ürün kartı iskeleti. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-card">
      <Skeleton className="aspect-square rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-6 w-1/2" />
      </div>
    </div>
  );
}

/** Ürün kartı ızgarası iskeleti. */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
