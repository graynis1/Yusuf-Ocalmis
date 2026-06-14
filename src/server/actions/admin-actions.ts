"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { slugify } from "@/lib/utils";
import { refreshProductCache } from "@/feeds/runner";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Yetkisiz");
  return session.user.id;
}

export async function setMerchantStatusAction(merchantId: string, status: "APPROVED" | "SUSPENDED" | "PENDING") {
  await requireAdmin();
  await prisma.merchant.update({ where: { id: merchantId }, data: { status } });
  revalidatePath("/admin/magazalar");
  return { ok: true };
}

export async function approveSubscriptionAction(merchantId: string) {
  const adminId = await requireAdmin();
  const sub = await prisma.subscription.findUnique({ where: { merchantId } });
  if (!sub) return { error: "Abonelik yok" };
  await prisma.$transaction([
    prisma.subscription.update({ where: { merchantId }, data: { status: "active", approvedBy: adminId } }),
    prisma.merchant.update({ where: { id: merchantId }, data: { tier: sub.tier } }),
  ]);
  revalidatePath("/admin/magazalar");
  return { ok: true };
}

/** Eşleştirme kuyruğu: offer'ı seçilen ürüne bağla (merge). */
export async function mergeMatchAction(reviewId: string, offerId: string, productId: string) {
  await requireAdmin();
  const adminId = await requireAdmin();
  const offer = await prisma.offer.findUnique({ where: { id: offerId }, select: { productId: true } });
  await prisma.$transaction([
    prisma.offer.update({
      where: { id: offerId },
      data: { productId, matchMethod: "MANUAL", matchConfidence: 1 },
    }),
    prisma.matchReview.update({ where: { id: reviewId }, data: { status: "MERGED", reviewedBy: adminId } }),
  ]);
  await refreshProductCache(productId);
  if (offer?.productId && offer.productId !== productId) await refreshProductCache(offer.productId);
  revalidatePath("/admin/eslestirme");
  return { ok: true };
}

/** Eşleştirme kuyruğu: offer için yeni ürün oluştur (split). */
export async function newProductMatchAction(reviewId: string, offerId: string) {
  const adminId = await requireAdmin();
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { product: { select: { categoryId: true, brandId: true } } },
  });
  if (!offer) return { error: "Teklif yok" };

  const baseSlug = slugify(offer.title) || `urun-${Date.now()}`;
  let slug = baseSlug;
  const clash = await prisma.product.findUnique({ where: { slug } });
  if (clash) slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  const fallback = await prisma.category.findFirst({ select: { id: true } });
  const product = await prisma.product.create({
    data: {
      title: offer.title,
      slug,
      categoryId: offer.product?.categoryId ?? fallback!.id,
      brandId: offer.product?.brandId ?? null,
      imageUrl: offer.imageUrl,
    },
  });

  const old = offer.productId;
  await prisma.$transaction([
    prisma.offer.update({ where: { id: offerId }, data: { productId: product.id, matchMethod: "MANUAL", matchConfidence: 1 } }),
    prisma.matchReview.update({ where: { id: reviewId }, data: { status: "NEW_PRODUCT", reviewedBy: adminId } }),
  ]);
  await refreshProductCache(product.id);
  if (old) await refreshProductCache(old);
  revalidatePath("/admin/eslestirme");
  return { ok: true };
}

export async function rejectMatchAction(reviewId: string) {
  const adminId = await requireAdmin();
  await prisma.matchReview.update({ where: { id: reviewId }, data: { status: "REJECTED", reviewedBy: adminId } });
  revalidatePath("/admin/eslestirme");
  return { ok: true };
}

export async function toggleSponsoredAction(offerId: string, value: boolean) {
  await requireAdmin();
  await prisma.offer.update({ where: { id: offerId }, data: { isSponsored: value } });
  revalidatePath("/admin/sponsorlu");
  return { ok: true };
}

const categorySchema = z.object({
  name: z.string().min(2),
  parentId: z.string().optional(),
});

export async function createCategoryAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") || undefined,
  });
  if (!parsed.success) return { error: "Geçersiz" };

  const slug = slugify(parsed.data.name);
  let path = slug;
  if (parsed.data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parsed.data.parentId }, select: { path: true } });
    if (parent) path = `${parent.path}/${slug}`;
  }
  await prisma.category.create({
    data: { name: parsed.data.name, slug, path, parentId: parsed.data.parentId || null },
  });
  revalidatePath("/admin/kategoriler");
  return { ok: true };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) return { error: `Bu kategoride ${count} ürün var, önce taşı.` };
  await prisma.category.deleteMany({ where: { id, children: { none: {} } } });
  revalidatePath("/admin/kategoriler");
  return { ok: true };
}

export async function setUserRoleAction(userId: string, role: "USER" | "MERCHANT" | "ADMIN") {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/kullanicilar");
  return { ok: true };
}
