import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
}: {
  rating?: number | null;
  reviewCount?: number | null;
  size?: "sm" | "md";
  showCount?: boolean;
}) {
  if (!rating) return null;
  const full = Math.round(rating);
  const px = size === "md" ? "size-4" : "size-3.5";
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(px, i <= full ? "fill-amber-400 text-amber-400" : "fill-[var(--border)] text-[var(--border)]")}
          />
        ))}
      </div>
      <span className={cn("tabular font-semibold text-ink", size === "md" ? "text-sm" : "text-xs")}>
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount ? (
        <span className="text-xs text-[var(--muted)]">({reviewCount.toLocaleString("tr-TR")})</span>
      ) : null}
    </div>
  );
}
