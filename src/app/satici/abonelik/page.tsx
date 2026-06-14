import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/server/merchant";
import { TierSelector } from "@/components/merchant/tier-selector";

export const dynamic = "force-dynamic";

export default async function MerchantSubscriptionPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) redirect("/satici/kayit");

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold">Abonelik</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        İşine uygun planı seç. Daha fazla listing ve öne çıkarma hakkı için yükselt.
      </p>
      <TierSelector currentTier={merchant.tier} />
    </div>
  );
}
