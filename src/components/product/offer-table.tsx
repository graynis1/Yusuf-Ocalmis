import Image from "next/image";
import { Check, Truck, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PriceDelta } from "./price-delta";

export type OfferRow = {
  id: string;
  price: number;
  oldPrice: number | null;
  inStock: boolean;
  shippingInfo: string | null;
  isSponsored: boolean;
  merchantName: string;
  merchantLogo: string | null;
};

export function OfferTable({ offers }: { offers: OfferRow[] }) {
  const best = offers.find((o) => o.inStock) ?? offers[0];

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)]">
      <ul className="divide-y divide-[var(--border)]">
        {offers.map((o) => {
          const isBest = o.id === best?.id;
          return (
            <li
              key={o.id}
              className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${
                isBest ? "bg-[var(--save)]/5" : ""
              }`}
            >
              <div className="flex flex-1 items-center gap-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded border border-[var(--border)] bg-white">
                  {o.merchantLogo ? (
                    <Image src={o.merchantLogo} alt={o.merchantName} fill className="object-contain p-1" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-bold text-[var(--muted)]">
                      {o.merchantName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{o.merchantName}</span>
                    {isBest && <Badge variant="save">En iyi fiyat</Badge>}
                    {o.isSponsored && <Badge variant="sponsored">Sponsorlu</Badge>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-[var(--muted)]">
                    {o.shippingInfo && (
                      <span className="flex items-center gap-1">
                        <Truck className="size-3" /> {o.shippingInfo}
                      </span>
                    )}
                    {o.inStock ? (
                      <span className="flex items-center gap-1 text-[var(--save)]">
                        <Check className="size-3" /> Stokta
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[var(--rise)]">
                        <X className="size-3" /> Tükendi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                  <div className="tabular text-lg font-bold text-ink">{formatPrice(o.price)}</div>
                  <PriceDelta oldPrice={o.oldPrice} price={o.price} className="ml-auto" />
                </div>
                <a
                  href={`/out/${o.id}`}
                  className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-white transition-colors ${
                    isBest ? "bg-[var(--save)] hover:opacity-90" : "bg-[var(--brand)] hover:opacity-90"
                  }`}
                  rel="nofollow sponsored"
                >
                  Mağazaya git
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
