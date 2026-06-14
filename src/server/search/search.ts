import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeTitle } from "@/server/matching/normalize";

export type SortKey = "relevance" | "price_asc" | "price_desc" | "popular";

export interface SearchParams {
  q?: string;
  categorySlug?: string;
  brandSlugs?: string[];
  min?: number;
  max?: number;
  attrs?: Record<string, string[]>; // facet: { renk: ["Siyah"], ... }
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface SearchProductRow {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  brandName: string | null;
  lowestPrice: number | null;
  offerCount: number;
  isSponsored: boolean;
  rating: number | null;
  reviewCount: number;
}

export interface Facets {
  brands: { slug: string; name: string; count: number }[];
  categories: { slug: string; name: string; count: number }[];
  attributes: Record<string, { value: string; count: number }[]>;
  priceRange: { min: number; max: number } | null;
}

export interface SearchResult {
  items: SearchProductRow[];
  total: number;
  page: number;
  pageSize: number;
  facets: Facets;
}

/**
 * Tek giriş noktası: ileride Meilisearch'e geçiş bu dosyada olur.
 * Postgres tsvector tam metin + pg_trgm fallback.
 */
export async function searchProducts(params: SearchParams): Promise<SearchResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(60, params.pageSize ?? 24);
  const offset = (page - 1) * pageSize;

  // WHERE parçalarını topla
  const conds: Prisma.Sql[] = [];

  if (params.categorySlug) {
    conds.push(
      Prisma.sql`p."categoryId" IN (SELECT id FROM "Category" WHERE slug = ${params.categorySlug} OR path LIKE (SELECT path || '%' FROM "Category" WHERE slug = ${params.categorySlug}))`
    );
  }
  if (params.brandSlugs?.length) {
    conds.push(
      Prisma.sql`p."brandId" IN (SELECT id FROM "Brand" WHERE slug IN (${Prisma.join(params.brandSlugs)}))`
    );
  }
  if (params.min !== undefined) conds.push(Prisma.sql`p."lowestPrice" >= ${params.min}`);
  if (params.max !== undefined) conds.push(Prisma.sql`p."lowestPrice" <= ${params.max}`);

  if (params.attrs) {
    for (const [key, values] of Object.entries(params.attrs)) {
      if (values.length) {
        conds.push(
          Prisma.sql`p."attributes" ->> ${key} IN (${Prisma.join(values)})`
        );
      }
    }
  }

  // sadece teklifi olan ürünler
  conds.push(Prisma.sql`p."offerCount" > 0`);

  // arama terimi
  const q = params.q?.trim();
  let rankExpr = Prisma.sql`0`;
  if (q) {
    const norm = normalizeTitle(q);
    const tsq = norm.split(" ").filter(Boolean).map((t) => `${t}:*`).join(" & ") || norm;
    conds.push(
      Prisma.sql`(p."search_vector" @@ to_tsquery('simple', ${tsq}) OR similarity(p."title", ${norm}) > 0.15)`
    );
    rankExpr = Prisma.sql`(ts_rank(p."search_vector", to_tsquery('simple', ${tsq})) + similarity(p."title", ${norm}))`;
  }

  const whereSql = conds.length
    ? Prisma.sql`WHERE ${Prisma.join(conds, " AND ")}`
    : Prisma.empty;

  // sıralama
  const sort = params.sort ?? (q ? "relevance" : "popular");
  let orderSql: Prisma.Sql;
  switch (sort) {
    case "price_asc":
      orderSql = Prisma.sql`p."isSponsored" DESC NULLS LAST, p."lowestPrice" ASC NULLS LAST`;
      break;
    case "price_desc":
      orderSql = Prisma.sql`p."isSponsored" DESC NULLS LAST, p."lowestPrice" DESC NULLS LAST`;
      break;
    case "popular":
      orderSql = Prisma.sql`p."isSponsored" DESC NULLS LAST, p."offerCount" DESC`;
      break;
    default:
      orderSql = Prisma.sql`p."isSponsored" DESC NULLS LAST, ${rankExpr} DESC, p."offerCount" DESC`;
  }

  // isSponsored: üründe sponsorlu offer var mı (boost)
  const rows = await prisma.$queryRaw<SearchProductRow[]>(Prisma.sql`
    SELECT p.id, p.slug, p.title, p."imageUrl",
           b.name AS "brandName",
           p."lowestPrice"::float8 AS "lowestPrice",
           p."offerCount", p.rating, p."reviewCount",
           EXISTS(SELECT 1 FROM "Offer" o WHERE o."productId" = p.id AND o."isSponsored") AS "isSponsored"
    FROM "Product" p
    LEFT JOIN "Brand" b ON b.id = p."brandId"
    ${whereSql}
    ORDER BY ${orderSql}
    LIMIT ${pageSize} OFFSET ${offset}
  `);

  const totalRows = await prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
    SELECT COUNT(*)::bigint AS count FROM "Product" p ${whereSql}
  `);
  const total = Number(totalRows[0]?.count ?? 0);

  const facets = await computeFacets(whereSql);

  return { items: rows, total, page, pageSize, facets };
}

/** Facet sayımları — sonuç kümesi koşulları üzerinden. */
async function computeFacets(whereSql: Prisma.Sql): Promise<Facets> {
  const brands = await prisma.$queryRaw<{ slug: string; name: string; count: bigint }[]>(Prisma.sql`
    SELECT b.slug, b.name, COUNT(*)::bigint AS count
    FROM "Product" p JOIN "Brand" b ON b.id = p."brandId"
    ${whereSql}
    GROUP BY b.slug, b.name ORDER BY count DESC LIMIT 20
  `);

  const categories = await prisma.$queryRaw<{ slug: string; name: string; count: bigint }[]>(Prisma.sql`
    SELECT c.slug, c.name, COUNT(*)::bigint AS count
    FROM "Product" p JOIN "Category" c ON c.id = p."categoryId"
    ${whereSql}
    GROUP BY c.slug, c.name ORDER BY count DESC LIMIT 20
  `);

  const priceRows = await prisma.$queryRaw<{ min: number | null; max: number | null }[]>(Prisma.sql`
    SELECT MIN(p."lowestPrice")::float8 AS min, MAX(p."lowestPrice")::float8 AS max
    FROM "Product" p ${whereSql}
  `);

  // dinamik attribute facet (renk, hafıza vb.)
  const attrRows = await prisma.$queryRaw<{ key: string; value: string; count: bigint }[]>(Prisma.sql`
    SELECT kv.key AS key, kv.value AS value, COUNT(*)::bigint AS count
    FROM "Product" p, LATERAL jsonb_each_text(COALESCE(p."attributes", '{}'::jsonb)) AS kv
    ${whereSql}
    GROUP BY kv.key, kv.value
    ORDER BY count DESC
    LIMIT 60
  `);
  const attributes: Record<string, { value: string; count: number }[]> = {};
  for (const r of attrRows) {
    (attributes[r.key] ??= []).push({ value: r.value, count: Number(r.count) });
  }

  return {
    brands: brands.map((b) => ({ slug: b.slug, name: b.name, count: Number(b.count) })),
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, count: Number(c.count) })),
    attributes,
    priceRange:
      priceRows[0]?.min != null && priceRows[0]?.max != null
        ? { min: Math.floor(priceRows[0].min), max: Math.ceil(priceRows[0].max) }
        : null,
  };
}

/** Type-as-you-search önerileri. */
export async function suggest(q: string) {
  const term = q.trim();
  if (term.length < 2) return [];
  const norm = normalizeTitle(term);
  const like = `%${term}%`;

  const [products, categories, brands] = await Promise.all([
    prisma.$queryRaw<{ label: string; slug: string }[]>(Prisma.sql`
      SELECT title AS label, slug FROM "Product"
      WHERE "offerCount" > 0 AND (similarity(title, ${norm}) > 0.2 OR title ILIKE ${like})
      ORDER BY similarity(title, ${norm}) DESC, "offerCount" DESC
      LIMIT 6
    `),
    prisma.category.findMany({
      where: { name: { contains: term, mode: "insensitive" } },
      select: { name: true, slug: true },
      take: 3,
    }),
    prisma.brand.findMany({
      where: { name: { contains: term, mode: "insensitive" } },
      select: { name: true, slug: true },
      take: 3,
    }),
  ]);

  return [
    ...products.map((p) => ({ type: "product" as const, label: p.label, slug: p.slug })),
    ...categories.map((c) => ({ type: "category" as const, label: c.name, slug: c.slug })),
    ...brands.map((b) => ({ type: "brand" as const, label: b.name, slug: b.slug })),
  ];
}
