import Link from "next/link";
import { TrendingDown, ArrowRight, ShieldCheck, Store, LineChart, Tag, Search, Sparkles } from "lucide-react";
import {
  getTopDeals,
  getTrendingProducts,
  getCategoryTiles,
  getCategoryRails,
  getTopBrands,
} from "@/server/products";
import { ProductCard } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";

export const dynamic = "force-dynamic";

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
    safe(getTopDeals(6), []),
    safe(getTrendingProducts(6), []),
    safe(getCategoryTiles(10), []),
    safe(getCategoryRails(4, 6), []),
    safe(getTopBrands(16), []),
  ]);

  return (
    <div className="bg-[var(--surface)]">
      {/* Premium neon hero */}
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="neon-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -left-24 top-0 size-[28rem] rounded-full bg-[var(--brand)]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 -top-10 size-[26rem] rounded-full bg-[var(--brand-2)]/20 blur-[120px]" />
        <div className="container relative flex flex-col items-center py-16 text-center md:py-24">
          <span className="glass mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-[var(--muted)]">
            <Sparkles className="size-3.5 text-[var(--brand)]" /> Türkiye'nin akıllı fiyat motoru
          </span>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.05] md:text-6xl">
            Aynı ürün, <span className="text-gradient">en düşük fiyat.</span>
            <br className="hidden md:block" /> Tek aramada karşında.
          </h1>
          <p className="mt-5 max-w-xl text-base text-[var(--muted)] md:text-lg">
            Yüzlerce mağazayı tarar, fiyat geçmişini çıkarır, en doğru anı söyler.
            Sen sadece <span className="text-ink">"al"</span>'a bas.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ara"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] px-7 font-semibold text-white shadow-glow transition-transform hover:scale-[1.03]"
            >
              <Search className="size-4" /> Ürün ara
            </Link>
            <Link
              href="/ara?sort=price_asc"
              className="glass inline-flex h-12 items-center gap-2 rounded-full px-7 font-semibold text-ink transition-colors hover:bg-white/10"
            >
              <TrendingDown className="size-4 text-[var(--save)]" /> Günün fırsatları
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[var(--muted)]">
            <span className="flex items-center gap-1.5"><Store className="size-4 text-[var(--brand)]" /> 10+ mağaza tek yerde</span>
            <span className="flex items-center gap-1.5"><LineChart className="size-4 text-[var(--brand)]" /> Fiyat geçmişi grafikleri</span>
            <span className="flex items-center gap-1.5"><Tag className="size-4 text-[var(--save)]" /> Günlük fırsat takibi</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-[var(--brand)]" /> Tarafsız karşılaştırma</span>
          </div>
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
                className="card-hover group flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center"
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
                className="rounded-full border border-[var(--border)] bg-white/5 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-[var(--brand)]/50 hover:bg-white/10 hover:text-[var(--brand)]"
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
    </div>
  );
}
