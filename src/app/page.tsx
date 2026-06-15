import Link from "next/link";
import { TrendingDown, ArrowRight, ShieldCheck, Store, LineChart, Tag } from "lucide-react";
import {
  getTopDealsCached,
  getTrendingCached,
  getCategoryTilesCached,
  getCategoryRailsCached,
  getTopBrandsCached,
} from "@/server/cached";
import { ProductCard } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
import { RecentlyViewed } from "@/components/product/recently-viewed";

export const revalidate = 300;

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

function SectionHead({ title, href, icon }: { title: string; href?: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold md:text-xl">
        {icon}
        {title}
      </h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-[var(--brand)] hover:underline">
          Tümünü gör <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [deals, trending, tiles, rails, brands] = await Promise.all([
    safe(getTopDealsCached(6), []),
    safe(getTrendingCached(6), []),
    safe(getCategoryTilesCached(10), []),
    safe(getCategoryRailsCached(4, 6), []),
    safe(getTopBrandsCached(16), []),
  ]);

  return (
    <div className="bg-[var(--surface)]">
      {/* Kompakt değer şeridi */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="container flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-3 text-sm text-[var(--muted)]">
          <span className="flex items-center gap-1.5"><Store className="size-4 text-[var(--brand)]" /> 10+ mağaza tek yerde</span>
          <span className="flex items-center gap-1.5"><LineChart className="size-4 text-[var(--brand)]" /> Fiyat geçmişi grafikleri</span>
          <span className="flex items-center gap-1.5"><Tag className="size-4 text-[var(--save)]" /> Günlük fırsat takibi</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-[var(--brand)]" /> Tarafsız karşılaştırma</span>
        </div>
      </section>

      {/* Kategori grid (cimri tarzı) */}
      {tiles.length > 0 && (
        <section className="container pt-8">
          <h1 className="sr-only">FİYATBUL — fiyat karşılaştırma</h1>
          <SectionHead title="Kategoriler" href="/ara" />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10">
            {tiles.map((c) => (
              <Link
                key={c.slug}
                href={`/kategori/${c.slug}`}
                className="group flex flex-col items-center gap-2 rounded-lg border border-[var(--border)] bg-card p-3 text-center transition-shadow hover:border-[var(--border-strong)] hover:shadow-sm"
              >
                <div className="relative size-14 overflow-hidden rounded-full ring-1 ring-[var(--border)]">
                  <ProductImage src={null} alt={c.name} categorySlug={c.slug} sizes="56px" />
                </div>
                <span className="line-clamp-2 text-xs font-semibold text-ink group-hover:text-[var(--brand)]">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Günün fırsatları */}
      <section className="container pt-10">
        <SectionHead title="Günün en çok düşenleri" href="/ara?sort=price_asc" icon={<TrendingDown className="size-5 text-[var(--save)]" />} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {deals.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* Marka şeridi */}
      {brands.length > 0 && (
        <section className="container pt-10">
          <SectionHead title="Popüler markalar" />
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <Link
                key={b.slug}
                href={`/marka/${b.slug}`}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Kategori rafları */}
      {rails.map((rail) => (
        <section key={rail.slug} className="container pt-10">
          <SectionHead title={`En çok incelenen ${rail.name.toLocaleLowerCase("tr")}`} href={`/kategori/${rail.slug}`} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {rail.products.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </section>
      ))}

      {/* Trend */}
      {trending.length > 0 && (
        <section className="container py-10">
          <SectionHead title="Çok karşılaştırılanlar" href="/ara?sort=popular" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {trending.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </section>
      )}

      <RecentlyViewed />
    </div>
  );
}
