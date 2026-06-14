import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MerchantActions } from "@/components/admin/merchant-actions";

export const dynamic = "force-dynamic";

export default async function AdminMerchantsPage() {
  const merchants = await prisma.merchant.findMany({
    where: { isSystem: false },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      subscription: true,
      user: { select: { email: true } },
      _count: { select: { offers: true } },
    },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Mağaza onayları</h1>
      <ul className="space-y-3">
        {merchants.map((m) => (
          <li key={m.id} className="rounded-lg border border-[var(--border)] bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{m.name}</span>
                  <Badge variant={m.status === "APPROVED" ? "save" : m.status === "SUSPENDED" ? "rise" : "muted"}>
                    {m.status}
                  </Badge>
                  <Badge variant="brand">{m.tier}</Badge>
                  {m.subscription?.status === "pending" && <Badge variant="sponsored">Abonelik onayı bekliyor</Badge>}
                </div>
                <div className="mt-1 text-sm text-[var(--muted)]">
                  {m.user?.email} · {m._count.offers} listing · {formatDate(m.createdAt)}
                </div>
                {m.websiteUrl && (
                  <a href={m.websiteUrl} className="text-xs text-[var(--brand)]" rel="nofollow">{m.websiteUrl}</a>
                )}
              </div>
              <MerchantActions
                merchantId={m.id}
                status={m.status}
                hasPendingSub={m.subscription?.status === "pending"}
              />
            </div>
          </li>
        ))}
        {merchants.length === 0 && (
          <li className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            Başvuru yok.
          </li>
        )}
      </ul>
    </div>
  );
}
