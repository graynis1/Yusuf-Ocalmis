import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Son N günün günlük tıklama serisi (mağaza bazlı veya genel). */
export async function getClickSeries(days = 30, merchantId?: string) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const where = merchantId
    ? Prisma.sql`WHERE "createdAt" >= ${since} AND "merchantId" = ${merchantId}`
    : Prisma.sql`WHERE "createdAt" >= ${since}`;
  const rows = await prisma.$queryRaw<{ date: string; value: number }[]>(Prisma.sql`
    SELECT to_char(date_trunc('day', "createdAt"), 'DD Mon') AS date, COUNT(*)::int AS value
    FROM "Click" ${where}
    GROUP BY date_trunc('day', "createdAt")
    ORDER BY date_trunc('day', "createdAt") ASC
  `);
  return rows;
}

/** Mağaza özet istatistikleri. */
export async function getMerchantStats(merchantId: string) {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [listings, clicks30, totalClicks, merchant] = await Promise.all([
    prisma.offer.count({ where: { merchantId } }),
    prisma.click.count({ where: { merchantId, createdAt: { gte: since30 } } }),
    prisma.click.count({ where: { merchantId } }),
    prisma.merchant.findUnique({ where: { id: merchantId }, select: { commissionRate: true } }),
  ]);

  // tahmini komisyon: tıklama * ortalama dönüşüm * ortalama sepet (kaba) * komisyon
  const rate = merchant?.commissionRate ? Number(merchant.commissionRate) : 5;
  const estCommission = Math.round(clicks30 * 0.03 * 1500 * (rate / 100));

  return { listings, clicks30, totalClicks, estCommission };
}

/** En çok tıklanan ürünler. */
export async function getTopClickedProducts(merchantId: string, limit = 10) {
  const rows = await prisma.$queryRaw<{ title: string; slug: string; clicks: number }[]>(Prisma.sql`
    SELECT p.title, p.slug, COUNT(c.id)::int AS clicks
    FROM "Click" c
    JOIN "Offer" o ON o.id = c."offerId"
    JOIN "Product" p ON p.id = o."productId"
    WHERE c."merchantId" = ${merchantId}
    GROUP BY p.title, p.slug
    ORDER BY clicks DESC
    LIMIT ${limit}
  `);
  return rows;
}
