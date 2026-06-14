import { Prisma } from "@prisma/client";
import type { FeedSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getAdapter } from "./adapters";
import type { RawProduct } from "./types";
import { matchOffer } from "@/server/matching/match";
import { prismaMatchDeps } from "@/server/matching/prisma-deps";

/** Serverless süre sınırı: çağrı başına en çok bu kadar kalem işlenir. */
export const BATCH_SIZE = 200;

const brandCache = new Map<string, string>();
const categoryCache = new Map<string, string>();
let fallbackCategoryId: string | null = null;

async function ensureBrand(name?: string): Promise<string | null> {
  if (!name) return null;
  const slug = slugify(name);
  if (!slug) return null;
  if (brandCache.has(slug)) return brandCache.get(slug)!;
  const brand = await prisma.brand.upsert({
    where: { slug },
    update: {},
    create: { name: name.trim(), slug },
    select: { id: true },
  });
  brandCache.set(slug, brand.id);
  return brand.id;
}

async function ensureCategory(name?: string): Promise<string> {
  if (!name) return getFallbackCategory();
  // "Elektronik > Telefon" gibi yolların son parçasını kullan
  const leaf = name.split(/[>/]/).pop()!.trim();
  const slug = slugify(leaf);
  if (!slug) return getFallbackCategory();
  if (categoryCache.has(slug)) return categoryCache.get(slug)!;
  const existing = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
  if (existing) {
    categoryCache.set(slug, existing.id);
    return existing.id;
  }
  const created = await prisma.category.create({
    data: { name: leaf, slug, path: slug },
    select: { id: true },
  });
  categoryCache.set(slug, created.id);
  return created.id;
}

async function getFallbackCategory(): Promise<string> {
  if (fallbackCategoryId) return fallbackCategoryId;
  const cat = await prisma.category.upsert({
    where: { slug: "diger" },
    update: {},
    create: { name: "Diğer", slug: "diger", path: "diger", order: 999 },
    select: { id: true },
  });
  fallbackCategoryId = cat.id;
  return cat.id;
}

/** Bir ürün için lowestPrice + offerCount cache'ini tazele. */
export async function refreshProductCache(productId: string) {
  const agg = await prisma.offer.aggregate({
    where: { productId, inStock: true },
    _min: { price: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      lowestPrice: agg._min.price ?? null,
      offerCount: agg._count,
    },
  });
}

interface ProcessResult {
  created: number;
  updated: number;
  processed: number;
}

/** Tek bir RawProduct'ı işle: offer upsert + fiyat geçmişi + eşleştirme. İdempotent. */
async function processItem(source: FeedSource, item: RawProduct): Promise<"created" | "updated"> {
  const existing = await prisma.offer.findUnique({
    where: { merchantId_externalId: { merchantId: source.merchantId, externalId: item.externalId } },
    select: { id: true, price: true, productId: true },
  });

  const price = new Prisma.Decimal(item.price.toFixed(2));
  const oldPrice = item.oldPrice ? new Prisma.Decimal(item.oldPrice.toFixed(2)) : null;

  const offer = await prisma.offer.upsert({
    where: { merchantId_externalId: { merchantId: source.merchantId, externalId: item.externalId } },
    create: {
      merchantId: source.merchantId,
      externalId: item.externalId,
      title: item.title,
      url: item.url,
      imageUrl: item.imageUrl,
      price,
      oldPrice,
      currency: item.currency ?? "TRY",
      inStock: item.inStock ?? true,
      rawData: item.raw as Prisma.InputJsonValue,
      lastSeenAt: new Date(),
    },
    update: {
      title: item.title,
      url: item.url,
      imageUrl: item.imageUrl,
      price,
      oldPrice,
      inStock: item.inStock ?? true,
      rawData: item.raw as Prisma.InputJsonValue,
      lastSeenAt: new Date(),
    },
    select: { id: true, productId: true },
  });

  const priceChanged = !existing || !existing.price.equals(price);

  // Eşleştirme: zaten ürüne bağlıysa tekrar eşleştirme.
  let productId = offer.productId;
  if (!productId) {
    const brandId = await ensureBrand(item.brand);
    const categoryId = await ensureCategory(item.category);
    const decision = await matchOffer(
      { title: item.title, brand: item.brand, gtin: item.gtin, mpn: item.mpn, categoryId, brandId },
      prismaMatchDeps
    );

    if (decision.action === "LINK") {
      productId = decision.productId;
      await prisma.offer.update({
        where: { id: offer.id },
        data: { productId, matchConfidence: decision.confidence, matchMethod: decision.method },
      });
    } else if (decision.action === "NEW") {
      const product = await createProduct(item, brandId, categoryId);
      productId = product.id;
      await prisma.offer.update({
        where: { id: offer.id },
        data: { productId, matchConfidence: decision.confidence, matchMethod: "FUZZY" },
      });
    } else {
      // REVIEW: insan kuyruğuna; offer bağlanmadan beklemesin diye en iyi adaya geçici bağla
      const best = decision.candidates[0];
      productId = best?.productId ?? (await createProduct(item, brandId, categoryId)).id;
      await prisma.offer.update({
        where: { id: offer.id },
        data: { productId, matchConfidence: decision.confidence, matchMethod: "FUZZY" },
      });
      await prisma.matchReview.upsert({
        where: { offerId: offer.id },
        create: {
          offerId: offer.id,
          candidates: decision.candidates as unknown as Prisma.InputJsonValue,
          confidence: decision.confidence,
        },
        update: {
          candidates: decision.candidates as unknown as Prisma.InputJsonValue,
          confidence: decision.confidence,
        },
      });
    }
  }

  if (productId && priceChanged) {
    await prisma.priceHistory.create({
      data: { productId, offerId: offer.id, price },
    });
  }
  if (productId) await refreshProductCache(productId);

  return existing ? "updated" : "created";
}

async function createProduct(item: RawProduct, brandId: string | null, categoryId: string) {
  const baseSlug = slugify(item.title) || `urun-${Date.now()}`;
  let slug = baseSlug;
  // benzersizlik
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!clash) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return prisma.product.create({
    data: {
      title: item.title,
      slug,
      brandId,
      categoryId,
      gtin: item.gtin ?? null,
      mpn: item.mpn ?? null,
      imageUrl: item.imageUrl,
      attributes: (item.attributes as Prisma.InputJsonValue) ?? Prisma.JsonNull,
    },
    select: { id: true },
  });
}

/**
 * Bir FeedSource'u bounded-batch + resumable işler.
 * cursor = işlenmiş kalem sayısı (index). Batch dolunca cursor kaydedilir.
 */
export async function runFeed(source: FeedSource): Promise<ProcessResult> {
  // Açık run var mı, yoksa yeni başlat.
  let run = await prisma.ingestionRun.findFirst({
    where: { feedSourceId: source.id, status: "RUNNING" },
    orderBy: { startedAt: "desc" },
  });
  if (!run) {
    run = await prisma.ingestionRun.create({
      data: { feedSourceId: source.id, status: "RUNNING", cursor: "0" },
    });
  }

  const startIndex = Number(run.cursor ?? "0");
  const adapter = getAdapter(source.type);
  const result: ProcessResult = { created: 0, updated: 0, processed: 0 };
  const errors: { externalId?: string; message: string }[] = [];

  let index = 0;
  let reachedEnd = true;
  try {
    for await (const item of adapter.fetch(source)) {
      if (index < startIndex) {
        index++;
        continue;
      }
      if (result.processed >= BATCH_SIZE) {
        reachedEnd = false;
        break;
      }
      try {
        const r = await processItem(source, item);
        if (r === "created") result.created++;
        else result.updated++;
      } catch (e) {
        errors.push({ externalId: item.externalId, message: (e as Error).message });
      }
      result.processed++;
      index++;
    }
  } catch (e) {
    errors.push({ message: `Feed okuma hatası: ${(e as Error).message}` });
    reachedEnd = false;
  }

  const newCursor = String(startIndex + result.processed);
  const finished = reachedEnd;

  await prisma.ingestionRun.update({
    where: { id: run.id },
    data: {
      cursor: finished ? null : newCursor,
      itemsProcessed: { increment: result.processed },
      itemsCreated: { increment: result.created },
      itemsUpdated: { increment: result.updated },
      errors: errors.length ? (errors as unknown as Prisma.InputJsonValue) : undefined,
      status: finished ? (errors.length ? "PARTIAL" : "SUCCESS") : "RUNNING",
      finishedAt: finished ? new Date() : null,
    },
  });

  await prisma.feedSource.update({
    where: { id: source.id },
    data: {
      lastRunAt: new Date(),
      lastStatus: finished ? (errors.length ? "PARTIAL" : "SUCCESS") : "RUNNING",
      lastError: errors[0]?.message ?? null,
      itemCount: { increment: result.created },
    },
  });

  return result;
}

/** Cron giriş noktası: due olan feed'leri sırayla bounded işler. */
export async function runDueFeeds(maxFeeds = 5): Promise<{ feed: string; result: ProcessResult }[]> {
  const feeds = await prisma.feedSource.findMany({
    where: { enabled: true },
    orderBy: [{ lastRunAt: { sort: "asc", nulls: "first" } }],
    take: maxFeeds,
  });
  const out: { feed: string; result: ProcessResult }[] = [];
  for (const feed of feeds) {
    const result = await runFeed(feed);
    out.push({ feed: feed.name, result });
  }
  return out;
}
