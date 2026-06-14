import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductCardData } from "@/components/product/product-card";

/** Günün en çok düşen fiyatları — oldPrice/price farkı en büyük teklifli ürünler. */
export async function getTopDeals(limit = 12): Promise<ProductCardData[]> {
  const rows = await prisma.$queryRaw<
    {
      slug: string;
      title: string;
      imageUrl: string | null;
      brandName: string | null;
      lowestPrice: number | null;
      oldPrice: number | null;
      offerCount: number;
      rating: number | null;
      reviewCount: number;
      categorySlug: string | null;
    }[]
  >(Prisma.sql`
    SELECT p.slug, p.title, p."imageUrl", b.name AS "brandName",
           p."lowestPrice"::float8 AS "lowestPrice",
           o."oldPrice"::float8 AS "oldPrice",
           p."offerCount", p.rating, p."reviewCount", c.slug AS "categorySlug"
    FROM "Product" p
    JOIN "Offer" o ON o."productId" = p.id AND o.price = p."lowestPrice"
    LEFT JOIN "Brand" b ON b.id = p."brandId"
    LEFT JOIN "Category" c ON c.id = p."categoryId"
    WHERE o."oldPrice" IS NOT NULL AND o."oldPrice" > o.price AND p."offerCount" > 0
    ORDER BY (o."oldPrice" - o.price) / o."oldPrice" DESC
    LIMIT ${limit}
  `);
  return rows.map((r) => ({ ...r, isSponsored: false }));
}

/** Popüler (en çok teklifli) ürünler. */
export async function getTrendingProducts(limit = 12): Promise<ProductCardData[]> {
  const rows = await prisma.product.findMany({
    where: { offerCount: { gt: 0 } },
    orderBy: { offerCount: "desc" },
    take: limit,
    select: {
      slug: true,
      title: true,
      imageUrl: true,
      offerCount: true,
      lowestPrice: true,
      rating: true,
      reviewCount: true,
      brand: { select: { name: true } },
      category: { select: { slug: true } },
    },
  });
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    imageUrl: r.imageUrl,
    brandName: r.brand?.name ?? null,
    categorySlug: r.category?.slug ?? null,
    lowestPrice: r.lowestPrice ? Number(r.lowestPrice) : null,
    offerCount: r.offerCount,
    rating: r.rating,
    reviewCount: r.reviewCount,
  }));
}

/** Üst seviye kategoriler (ürün sayısıyla). */
export async function getTopCategories(limit = 8) {
  const cats = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    take: limit,
    select: { name: true, slug: true, iconKey: true },
  });
  return cats;
}

/** Ürünü olan yaprak kategoriler + temsili görsel + ürün sayısı (ana sayfa kartları). */
export async function getCategoryTiles(limit = 12) {
  const rows = await prisma.$queryRaw<
    { name: string; slug: string; count: number; imageUrl: string | null }[]
  >(Prisma.sql`
    SELECT c.name, c.slug, COUNT(p.id)::int AS count,
           (SELECT p2."imageUrl" FROM "Product" p2 WHERE p2."categoryId" = c.id AND p2."imageUrl" IS NOT NULL ORDER BY p2."offerCount" DESC LIMIT 1) AS "imageUrl"
    FROM "Category" c
    JOIN "Product" p ON p."categoryId" = c.id AND p."offerCount" > 0
    GROUP BY c.id, c.name, c.slug
    ORDER BY count DESC
    LIMIT ${limit}
  `);
  return rows;
}

/** En çok ürünü olan markalar (marka şeridi). */
export async function getTopBrands(limit = 12) {
  const rows = await prisma.$queryRaw<{ name: string; slug: string; count: number }[]>(Prisma.sql`
    SELECT b.name, b.slug, COUNT(p.id)::int AS count
    FROM "Brand" b JOIN "Product" p ON p."brandId" = b.id AND p."offerCount" > 0
    GROUP BY b.id, b.name, b.slug
    ORDER BY count DESC
    LIMIT ${limit}
  `);
  return rows;
}

/** Ürün detay verisi. */
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      offers: {
        orderBy: [{ isSponsored: "desc" }, { price: "asc" }],
        include: { merchant: { select: { name: true, slug: true, logoUrl: true } } },
      },
    },
  });
  return product;
}

/** Ürün fiyat geçmişi (en düşük günlük). */
export async function getPriceHistory(productId: string, days = 90) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await prisma.$queryRaw<{ date: string; price: number }[]>(Prisma.sql`
    SELECT to_char(date_trunc('day', "recordedAt"), 'YYYY-MM-DD') AS date,
           MIN(price)::float8 AS price
    FROM "PriceHistory"
    WHERE "productId" = ${productId} AND "recordedAt" >= ${since}
    GROUP BY 1
    ORDER BY 1 ASC
  `);
  return rows;
}

/** Benzer ürünler (aynı kategori). */
export async function getSimilarProducts(
  categoryId: string,
  excludeId: string,
  limit = 6
): Promise<ProductCardData[]> {
  const rows = await prisma.product.findMany({
    where: { categoryId, id: { not: excludeId }, offerCount: { gt: 0 } },
    orderBy: { offerCount: "desc" },
    take: limit,
    select: {
      slug: true,
      title: true,
      imageUrl: true,
      offerCount: true,
      lowestPrice: true,
      rating: true,
      reviewCount: true,
      brand: { select: { name: true } },
      category: { select: { slug: true } },
    },
  });
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    imageUrl: r.imageUrl,
    brandName: r.brand?.name ?? null,
    categorySlug: r.category?.slug ?? null,
    lowestPrice: r.lowestPrice ? Number(r.lowestPrice) : null,
    offerCount: r.offerCount,
    rating: r.rating,
    reviewCount: r.reviewCount,
  }));
}
