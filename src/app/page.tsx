import Link from "next/link";
import { TrendingDown, ArrowRight, ShieldCheck, Store, LineChart } from "lucide-react";
import {
  getTopDeals,
  getTrendingProducts,
  getCategoryTiles,
  getTopBrands,
} from "@/server/products";
import { ProductCard } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
import { ProductGrid } from "@/components/product/product-grid";
import { SearchBar } from "@/components/search/search-bar";

export const dynamic = "force-dynamic";

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [deals, trending, tiles, brands] = await Promise.all([
    safe(getTopDeals(12), []),
    safe(getTrendingProducts(10), []),
    safe(getCategoryTiles(10), []),
    safe(getTopBrands(14), []),
  ]);

  return (
    <div>
      {/* Kahraman */}
      <section className="border-b border-[var(--border)] bg-gradient-to-b from-white to-[var(--surface)]">
        <div className="container py-12 text-center md:py-16">
          <h1 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight md:text-5xl">
            Aradığın ürünü <span className="text-[var(--brand)]">en ucuza</span> bul
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
            Yüzlerce mağazanın fiyatını karşılaştır, fiyat geçmişini gör, doğru anda al.
          </p>
          <div className="mx-auto mt-7 max-w-2xl">
            <SearchBar />
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
            <span className="flex items-center gap-1.5"><Store className="size-4 text-[var(--brand)]" /> 10+ mağaza</span>
            <span className="flex items-center gap-1.5"><LineChart className="size-4 text-[var(--brand)]" /> Fiyat geçmişi</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-[var(--brand)]" /> Tarafsız karşılaştırma</span>
          </div>
        </div>
      </section>

      {/* Kategoriler — görselli kartlar */}
      {tiles.length > 0 && (
        <section className="container py-10">
          <h2 className="mb-5 font-display text-xl font-bold">Kategoriler</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {tiles.map((c) => (
              <Link
                key={c.slug}
                href={`/kategori/${c.slug}`}
                className="group overflow-hidden rounded-lg border border-[var(--border)] bg-card transition-all hover:-translate-y-0.5 hover:border-[var(--brand)]/40 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-white">
                  <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
                    <ProductImage src={null} alt={c.name} categorySlug={c.slug} sizes="200px" />
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-ink group-hover:text-[var(--brand)]">{c.name}</div>
                  <div className="text-xs text-[var(--muted)]">{c.count} ürün</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Signature: günün en çok düşen fiyatları */}
      <section className="container py-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="size-5 text-[var(--save)]" />
            <h2 className="font-display text-xl font-bold">Günün en çok düşen fiyatları</h2>
          </div>
          <Link href="/ara?sort=price_asc" className="flex items-center gap-1 text-sm font-medium text-[var(--brand)]">
            Tümü <ArrowRight className="size-4" />
          </Link>
        </div>
        {deals.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {deals.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-[var(--muted)]">
            Katalog henüz hazırlanıyor.
          </p>
        )}
      </section>

      {/* Markalar şeridi */}
      {brands.length > 0 && (
        <section className="container py-6">
          <h2 className="mb-4 font-display text-xl font-bold">Popüler markalar</h2>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <Link
                key={b.slug}
                href={`/marka/${b.slug}`}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                {b.name} <span className="text-xs text-[var(--muted)]">({b.count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trend ürünler */}
      <section className="container py-10">
        <h2 className="mb-5 font-display text-xl font-bold">Çok karşılaştırılan ürünler</h2>
        <ProductGrid products={trending} />
      </section>
    </div>
  );
}
