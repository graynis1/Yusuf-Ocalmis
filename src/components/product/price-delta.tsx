import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { discountPct, formatPrice } from "@/lib/utils";

/** Tutarlı fiyat-delta dili: tasarruf yeşil (--save), artış kırmızı (--rise). */
export function PriceDelta({
  oldPrice,
  price,
  className,
}: {
  oldPrice?: number | null;
  price: number;
  className?: string;
}) {
  if (!oldPrice || oldPrice <= price) return null;
  const pct = discountPct(oldPrice, price);
  const diff = oldPrice - price;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-[var(--save)]/12 px-2 py-0.5 text-xs font-semibold text-[var(--save)]",
        className
      )}
    >
      <ArrowDown className="size-3" />
      <span className="tabular">−{formatPrice(diff)}</span>
      <span>(%{pct})</span>
    </span>
  );
}

export function PriceRise({
  oldPrice,
  price,
  className,
}: {
  oldPrice?: number | null;
  price: number;
  className?: string;
}) {
  if (!oldPrice || oldPrice >= price) return null;
  const pct = Math.round(((price - oldPrice) / oldPrice) * 100);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-[var(--rise)]/12 px-2 py-0.5 text-xs font-semibold text-[var(--rise)]",
        className
      )}
    >
      <ArrowUp className="size-3" />
      <span>+%{pct}</span>
    </span>
  );
}
