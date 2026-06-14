import Link from "next/link";
import { TrendingDown, ArrowRight } from "lucide-react";
import { getTopDeals, getTrendingProducts, getTopCategories } from "@/server/products";
import { ProductCard } from "@/components/product/product-card";
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
  const [deals, trending, categories] = await Promise.all([
    safe(getTopDeals(12), []),
    safe(getTrendingProducts(10), []),
    safe(getTopCategories(8), []),
  ]);

  return (
    <div>
      {/* Kahraman: dev arama çubuğu */}
      <section className="border-b border-[var(--border)] bg-gradient-to-b from-white to-[var(--surface)]">
        <div className="container py-14 text-center md:py-20">
          <h1 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight md:text-5xl">
            Aradığın ürünü <span className="text-[var(--brand)]">en ucuza</span> bul
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
            Yüzlerce mağazanın fiyatını karşılaştır, fiyat geçmişini gör, doğru anda al.
          </p>
          <div className="mx-auto mt-7 max-w-2xl">
            <SearchBar />
          </div>
          {categories.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/kategori/${c.slug}`}
                  className="rounded-full border border-[var(--border)] bg-white px-4 py-1.5 text-sm text-ink transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Signature: günün en çok düşen fiyatları */}
      <section className="container py-10">
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
            Katalog henüz hazırlanıyor. Veriler yüklendiğinde fırsatlar burada görünecek.
          </p>
        )}
      </section>

      {/* Popüler kategoriler */}
      {categories.length > 0 && (
        <section className="container py-6">
          <h2 className="mb-5 font-display text-xl font-bold">Popüler kategoriler</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/kategori/${c.slug}`}
                className="flex flex-col items-center gap-2 rounded-lg border border-[var(--border)] bg-card p-5 text-center transition-shadow hover:shadow-md"
              >
                <span className="text-sm font-semibold">{c.name}</span>
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
