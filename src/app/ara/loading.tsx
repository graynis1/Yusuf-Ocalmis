import { ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-6">
      <Skeleton className="mb-4 h-6 w-56" />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  );
}
