"use client";

import * as React from "react";
import { History } from "lucide-react";
import { ProductCard, type ProductCardData } from "./product-card";

const KEY = "fb:recent";
const CAP = 12;

function read(): ProductCardData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProductCardData[]) : [];
  } catch {
    return [];
  }
}

/** Ürün sayfasında çağrılır: gezilen ürünü localStorage'a kaydeder (UI yok). */
export function RecentlyViewedTracker({ product }: { product: ProductCardData }) {
  React.useEffect(() => {
    try {
      const list = read().filter((p) => p.slug !== product.slug);
      list.unshift(product);
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, CAP)));
    } catch {
      /* yoksay */
    }
  }, [product]);
  return null;
}

/** Son gezilen ürünler rafı (hidrasyon sonrası dolar). */
export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const [items, setItems] = React.useState<ProductCardData[]>([]);

  React.useEffect(() => {
    setItems(read().filter((p) => p.slug !== excludeSlug).slice(0, 6));
  }, [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section className="container py-10">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold md:text-xl">
        <History className="size-5 text-[var(--muted)]" /> Son gezdiklerin
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
    </section>
  );
}
