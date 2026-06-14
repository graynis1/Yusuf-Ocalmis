import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";

/** Giriş yapan kullanıcının mağazasını getir (yoksa null). */
export async function getCurrentMerchant() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.merchant.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  });
}

/** Tier limitleri. */
export const TIER_LIMITS: Record<string, { listings: number; label: string; featured: boolean }> = {
  FREE: { listings: 50, label: "Ücretsiz", featured: false },
  PRO: { listings: 1000, label: "Pro", featured: true },
  PREMIUM: { listings: 100000, label: "Premium", featured: true },
};
