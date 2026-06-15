import { ProductGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="mb-6 h-7 w-48 animate-pulse rounded-md bg-[var(--border)]/70" />
      <ProductGridSkeleton count={12} />
    </div>
  );
}
