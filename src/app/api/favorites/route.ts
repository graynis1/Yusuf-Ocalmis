import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ productId: z.string().cuid() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const { productId } = parsed.data;
  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }
  await prisma.favorite.create({ data: { userId, productId } });
  return NextResponse.json({ favorited: true });
}
