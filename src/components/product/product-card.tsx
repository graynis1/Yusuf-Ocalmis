import Link from "next/link";
import { Truck } from "lucide-react";
import { formatPrice, discountPct } from "@/lib/utils";
import { PriceDelta } from "./price-delta";
import { RatingStars } from "./rating-stars";
import { ProductImage } from "./product-image";
import { Badge } from "@/components/ui/badge";

export type ProductCardData = {
  slug: string;
  title: string;
  imageUrl?: string | null;
  brandName?: string | null;
  categorySlug?: string | null;
  lowestPrice?: number | null;
  oldPrice?: number | null;
  offerCount: number;
  isSponsored?: boolean;
  rating?: number | null;
  reviewCount?: number | null;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const pct =
    p.oldPrice && p.lowestPrice && p.oldPrice > p.lowestPrice
      ? discountPct(p.oldPrice, Number(p.lowestPrice))
      : 0;

  return (
    <Link
      href={`/urun/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-card transition-all hover:-translate-y-0.5 hover:border-[var(--brand)]/40 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
          <ProductImage
            src={p.imageUrl}
            alt={p.title}
            brand={p.brandName}
            categorySlug={p.categorySlug}
            sizes="(max-width:768px) 50vw, 240px"
          />
        </div>
        {pct > 0 && (
          <span className="absolute right-2 top-2 rounded-md bg-[var(--save)] px-1.5 py-0.5 text-xs font-bold text-white">
            %{pct}
          </span>
        )}
        {p.isSponsored && (
          <Badge variant="sponsored" className="absolute left-2 top-2">
            Sponsorlu
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {p.brandName && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            {p.brandName}
          </span>
        )}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-ink group-hover:text-[var(--brand)]">
          {p.title}
        </h3>
        {p.rating ? <RatingStars rating={p.rating} reviewCount={p.reviewCount} /> : <div className="h-3.5" />}
        <div className="mt-auto pt-1">
          <div className="text-[11px] text-[var(--muted)]">{p.offerCount} satıcı · en ucuz</div>
          <div className="flex items-baseline gap-2">
            <span className="tabular text-lg font-extrabold text-ink">{formatPrice(p.lowestPrice)}</span>
            {pct > 0 && (
              <span className="tabular text-xs text-[var(--muted)] line-through">{formatPrice(p.oldPrice)}</span>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <PriceDelta oldPrice={p.oldPrice} price={Number(p.lowestPrice ?? 0)} />
            <span className="flex items-center gap-1 text-[11px] text-[var(--save)]">
              <Truck className="size-3" /> Kargo bedava
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
