import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Günlük: her ürün için fiyat snapshot'ı yaz, cache tazele, fiyat alarmlarını kontrol et.
 * Bounded: ürünleri sayfalı işler.
 */
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    // 1) Snapshot + cache tazele (bounded batch)
    const products = await prisma.product.findMany({
      where: { offerCount: { gt: 0 } },
      select: { id: true },
      take: 1000,
    });

    let snapshots = 0;
    for (const p of products) {
      const agg = await prisma.offer.aggregate({
        where: { productId: p.id, inStock: true },
        _min: { price: true },
        _count: true,
      });
      const min = agg._min.price;
      await prisma.product.update({
        where: { id: p.id },
        data: { lowestPrice: min ?? null, offerCount: agg._count },
      });
      if (min) {
        await prisma.priceHistory.create({ data: { productId: p.id, price: min } });
        snapshots++;
      }
    }

    // 2) Fiyat alarmları: hedefin altına düşenleri işaretle
    const alerts = await prisma.priceAlert.findMany({
      where: { active: true, notifiedAt: null },
      include: { product: { select: { lowestPrice: true } } },
    });
    let triggered = 0;
    for (const a of alerts) {
      const lp = a.product.lowestPrice;
      if (lp && new Prisma.Decimal(lp).lte(a.targetPrice)) {
        await prisma.priceAlert.update({ where: { id: a.id }, data: { notifiedAt: new Date() } });
        triggered++;
        // TODO: e-posta gönderimi (SMTP/Resend) entegrasyonu eklenebilir.
      }
    }

    return NextResponse.json({ ok: true, snapshots, triggeredAlerts: triggered });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
