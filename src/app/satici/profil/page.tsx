import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getCurrentMerchant } from "@/server/merchant";
import { MerchantProfileForm } from "@/components/merchant/profile-form";

export const dynamic = "force-dynamic";

export default async function MerchantProfilePage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) redirect("/satici/kayit");

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Mağaza profili</h1>
          <p className="text-sm text-[var(--muted)]">
            Müşterilere mağaza sayfanda gösterilen bilgiler.
          </p>
        </div>
        <Link
          href={`/magaza/${merchant.slug}`}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--brand)] hover:underline"
        >
          Vitrini gör <ExternalLink className="size-4" />
        </Link>
      </div>

      <MerchantProfileForm
        initial={{
          name: merchant.name,
          sector: merchant.sector ?? "",
          description: merchant.description ?? "",
          contactName: merchant.contactName ?? "",
          email: merchant.email ?? "",
          phone: merchant.phone ?? "",
          taxId: merchant.taxId ?? "",
          city: merchant.city ?? "",
          address: merchant.address ?? "",
          websiteUrl: merchant.websiteUrl ?? "",
          logoUrl: merchant.logoUrl ?? "",
        }}
      />
    </div>
  );
}
