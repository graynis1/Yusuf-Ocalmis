import { Skeleton, ProductGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-8">
      <Skeleton className="mb-4 h-4 w-64" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr]">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
      <div className="mt-12">
        <Skeleton className="mb-5 h-6 w-40" />
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}
