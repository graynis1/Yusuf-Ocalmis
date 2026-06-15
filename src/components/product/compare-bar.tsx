"use client";

import Link from "next/link";
import { GitCompare, X, Trash2 } from "lucide-react";
import { useCompare, removeCompare, clearCompare } from "@/lib/compare";
import { ProductImage } from "./product-image";

/** Sayfa altında yüzen karşılaştırma çubuğu (1+ ürün seçiliyken görünür). */
export function CompareBar() {
  const items = useCompare();
  if (items.length === 0) return null;

  const slugs = items.map((p) => p.slug).join(",");
  const canCompare = items.length >= 2;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-fade-up border-t border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="container flex items-center gap-3 py-3">
        <span className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-ink sm:flex">
          <GitCompare className="size-4 text-[var(--brand)]" /> Karşılaştır
        </span>

        <div className="flex flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((p) => (
            <div
              key={p.slug}
              className="group relative size-12 shrink-0 overflow-hidden rounded-md border border-[var(--border)] bg-white"
            >
              <ProductImage
                src={p.imageUrl}
                alt={p.title}
                brand={p.brandName}
                categorySlug={p.categorySlug}
                sizes="48px"
              />
              <button
                onClick={() => removeCompare(p.slug)}
                aria-label={`${p.title} çıkar`}
                className="absolute right-0 top-0 grid size-4 place-items-center rounded-bl bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={clearCompare}
          className="hidden shrink-0 items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--rise)] sm:flex"
        >
          <Trash2 className="size-3.5" /> Temizle
        </button>

        <Link
          href={`/karsilastir?slugs=${slugs}`}
          aria-disabled={!canCompare}
          className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold text-white ${
            canCompare
              ? "bg-[var(--brand)] hover:brightness-95"
              : "pointer-events-none bg-[var(--muted)]/50"
          }`}
        >
          Karşılaştır ({items.length})
        </Link>
      </div>
    </div>
  );
}
