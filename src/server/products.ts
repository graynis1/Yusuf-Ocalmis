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
    }[]
  >(Prisma.sql`
    SELECT p.slug, p.title, p."imageUrl", b.name AS "brandName",
           p."lowestPrice"::float8 AS "lowestPrice",
           o."oldPrice"::float8 AS "oldPrice",
           p."offerCount"
    FROM "Product" p
    JOIN "Offer" o ON o."productId" = p.id AND o.price = p."lowestPrice"
    LEFT JOIN "Brand" b ON b.id = p."brandId"
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
      brand: { select: { name: true } },
    },
  });
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    imageUrl: r.imageUrl,
    brandName: r.brand?.name ?? null,
    lowestPrice: r.lowestPrice ? Number(r.lowestPrice) : null,
    offerCount: r.offerCount,
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
      brand: { select: { name: true } },
    },
  });
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    imageUrl: r.imageUrl,
    brandName: r.brand?.name ?? null,
    lowestPrice: r.lowestPrice ? Number(r.lowestPrice) : null,
    offerCount: r.offerCount,
  }));
}
