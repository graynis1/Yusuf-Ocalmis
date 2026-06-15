import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Store } from "lucide-react";
import type { Metadata } from "next";
import { auth } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import {
  getProductBySlug,
  getPriceHistory,
  getSimilarProducts,
} from "@/server/products";
import { formatPrice, discountPct } from "@/lib/utils";
import { OfferTable, type OfferRow } from "@/components/product/offer-table";
import { PriceHistoryChart } from "@/components/product/price-history-chart";
import { ProductActions } from "@/components/product/product-actions";
import { ProductGrid } from "@/components/product/product-grid";
import { PriceDelta } from "@/components/product/price-delta";
import { RatingStars } from "@/components/product/rating-stars";
import { ProductImage } from "@/components/product/product-image";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const p = await prisma.product.findUnique({ where: { slug: params.slug }, select: { title: true } });
    return { title: p?.title ?? "Ürün" };
  } catch {
    return { title: "Ürün" };
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug).catch(() => null);
  if (!product) notFound();

  const session = await auth().catch(() => null);
  const [history, similar] = await Promise.all([
    getPriceHistory(product.id, 90).catch(() => []),
    getSimilarProducts(product.categoryId, product.id, 6).catch(() => []),
  ]);

  let initialFavorite = false;
  let initialAlertPrice: number | null = null;
  if (session?.user?.id) {
    const [fav, alert] = await Promise.all([
      prisma.favorite.findUnique({
        where: { userId_productId: { userId: session.user.id, productId: product.id } },
      }),
      prisma.priceAlert.findUnique({
        where: { userId_productId: { userId: session.user.id, productId: product.id } },
      }),
    ]);
    initialFavorite = Boolean(fav);
    initialAlertPrice = alert?.active ? Number(alert.targetPrice) : null;
  }

  const offers: OfferRow[] = product.offers.map((o) => ({
    id: o.id,
    price: Number(o.price),
    oldPrice: o.oldPrice ? Number(o.oldPrice) : null,
    inStock: o.inStock,
    shippingInfo: o.shippingInfo,
    isSponsored: o.isSponsored,
    merchantName: o.merchant.name,
    merchantLogo: o.merchant.logoUrl,
  }));

  const best = offers.find((o) => o.inStock) ?? offers[0];
  const lowestPrice = best ? best.price : null;
  const attrs = (product.attributes as Record<string, string> | null) ?? {};

  return (
    <div className="container py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-[var(--muted)]" aria-label="breadcrumb">
        <Link href="/" className="hover:text-ink">Ana sayfa</Link>
        <ChevronRight className="size-3" />
        <Link href={`/kategori/${product.category.slug}`} className="hover:text-ink">
          {product.category.name}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr]">
        {/* Galeri */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-white">
            <ProductImage
              src={product.imageUrl}
              alt={product.title}
              brand={product.brand?.name}
              categorySlug={product.category.slug}
              sizes="420px"
              priority
            />
          </div>
        </div>

        {/* Bilgi */}
        <div className="space-y-6">
          <div>
            {product.brand && (
              <Link href={`/marka/${product.brand.slug}`} className="text-sm font-medium uppercase tracking-wide text-[var(--brand)]">
                {product.brand.name}
              </Link>
            )}
            <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">{product.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
              <span className="text-sm text-[var(--muted)]">{offers.length} satıcıda mevcut</span>
            </div>
          </div>

          {/* Öne çıkan özellikler (epey tarzı özet) */}
          {Object.keys(attrs).length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(attrs).slice(0, 4).map(([k, v]) => (
                <div key={k} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                  <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">{k}</div>
                  <div className="mt-0.5 text-sm font-semibold text-ink">{v}</div>
                </div>
              ))}
            </div>
          )}

          {/* En iyi fiyat kartı */}
          {best && (
            <div className="rounded-lg border-2 border-[var(--save)]/40 bg-[var(--save)]/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    En iyi fiyat
                  </span>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="tabular text-3xl font-extrabold text-[var(--save)]">
                      {formatPrice(best.price)}
                    </span>
                    {best.oldPrice && best.oldPrice > best.price && (
                      <span className="tabular text-sm text-[var(--muted)] line-through">
                        {formatPrice(best.oldPrice)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <PriceDelta oldPrice={best.oldPrice} price={best.price} />
                    <span className="text-sm text-[var(--muted)]">{best.merchantName}</span>
                  </div>
                </div>
                <a
                  href={`/out/${best.id}`}
                  className="inline-flex h-12 items-center rounded-md bg-[var(--save)] px-6 font-semibold text-white transition-colors hover:brightness-95"
                  rel="nofollow sponsored"
                >
                  Mağazaya git
                </a>
              </div>
            </div>
          )}

          <ProductActions
            productId={product.id}
            lowestPrice={lowestPrice}
            isLoggedIn={Boolean(session?.user)}
            initialFavorite={initialFavorite}
            initialAlertPrice={initialAlertPrice}
          />

          {/* Fiyat geçmişi */}
          <div className="rounded-lg border border-[var(--border)] bg-card p-5">
            <PriceHistoryChart data={history} />
          </div>

          {/* Teklif tablosu */}
          <div>
            <h2 className="mb-3 font-display text-lg font-bold">Tüm satıcılar</h2>
            <OfferTable offers={offers} />
          </div>

          {/* Teknik özellikler */}
          {Object.keys(attrs).length > 0 && (
            <div>
              <h2 className="mb-3 font-display text-lg font-bold">Teknik özellikler</h2>
              <dl className="overflow-hidden rounded-lg border border-[var(--border)]">
                {Object.entries(attrs).map(([k, v], i) => (
                  <div key={k} className={`flex ${i % 2 ? "bg-[var(--surface)]" : "bg-white"}`}>
                    <dt className="w-1/3 px-4 py-2 text-sm capitalize text-[var(--muted)]">{k}</dt>
                    <dd className="px-4 py-2 text-sm text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Benzer ürünler */}
      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 font-display text-xl font-bold">Benzer ürünler</h2>
          <ProductGrid products={similar} />
        </section>
      )}
    </div>
  );
}
