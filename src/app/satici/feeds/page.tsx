import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/server/merchant";
import { prisma } from "@/lib/prisma";
import { FeedManager } from "@/components/merchant/feed-manager";

export const dynamic = "force-dynamic";

export default async function MerchantFeedsPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) redirect("/satici/kayit");

  const feeds = await prisma.feedSource.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, type: true, url: true, enabled: true, lastStatus: true, itemCount: true },
  });

  return <FeedManager feeds={feeds} canManage={merchant.status === "APPROVED"} />;
}
