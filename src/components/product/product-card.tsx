import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { PriceDelta } from "./price-delta";
import { Badge } from "@/components/ui/badge";

export type ProductCardData = {
  slug: string;
  title: string;
  imageUrl?: string | null;
  brandName?: string | null;
  lowestPrice?: number | null;
  oldPrice?: number | null;
  offerCount: number;
  isSponsored?: boolean;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  return (
    <Link
      href={`/urun/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--surface)]">
        {p.imageUrl ? (
          <Image
            src={p.imageUrl}
            alt={p.title}
            fill
            sizes="(max-width:768px) 50vw, 240px"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--muted)]">
            <Store className="size-10" />
          </div>
        )}
        {p.isSponsored && (
          <Badge variant="sponsored" className="absolute left-2 top-2">
            Sponsorlu
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        {p.brandName && (
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            {p.brandName}
          </span>
        )}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-ink group-hover:text-[var(--brand)]">
          {p.title}
        </h3>
        <div className="mt-auto space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="tabular text-lg font-bold text-ink">
              {formatPrice(p.lowestPrice)}
            </span>
            {p.oldPrice && p.lowestPrice && p.oldPrice > p.lowestPrice ? (
              <span className="tabular text-xs text-[var(--muted)] line-through">
                {formatPrice(p.oldPrice)}
              </span>
            ) : null}
          </div>
          <div className="flex items-center justify-between">
            <PriceDelta oldPrice={p.oldPrice} price={Number(p.lowestPrice ?? 0)} />
            <span className="text-xs text-[var(--muted)]">{p.offerCount} satıcı</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
