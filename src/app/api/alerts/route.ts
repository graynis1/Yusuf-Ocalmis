import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/server/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  productId: z.string().cuid(),
  targetPrice: z.number().positive(),
});
const deleteSchema = z.object({
  productId: z.string().cuid().optional(),
  productSlug: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const { productId, targetPrice } = parsed.data;
  const userId = session.user.id;

  const alert = await prisma.priceAlert.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, targetPrice: new Prisma.Decimal(targetPrice), active: true },
    update: { targetPrice: new Prisma.Decimal(targetPrice), active: true, notifiedAt: null },
  });
  return NextResponse.json({ ok: true, alertId: alert.id });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success || (!parsed.data.productId && !parsed.data.productSlug)) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  let productId = parsed.data.productId;
  if (!productId && parsed.data.productSlug) {
    const product = await prisma.product.findUnique({
      where: { slug: parsed.data.productSlug },
      select: { id: true },
    });
    productId = product?.id;
  }
  if (!productId) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });

  await prisma.priceAlert.deleteMany({
    where: { userId: session.user.id, productId },
  });
  return NextResponse.json({ ok: true });
}
