import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminFeedsPage() {
  const feeds = await prisma.feedSource.findMany({
    orderBy: { lastRunAt: { sort: "desc", nulls: "last" } },
    include: {
      merchant: { select: { name: true, isSystem: true } },
      runs: { orderBy: { startedAt: "desc" }, take: 3 },
    },
  });

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold">Feed monitörü</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Toplam {feeds.length} feed kaynağı. Cron her saat başı bounded-batch çalıştırır.
      </p>
      <ul className="space-y-3">
        {feeds.map((f) => (
          <li key={f.id} className="rounded-lg border border-[var(--border)] bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{f.name}</span>
                <Badge variant="muted">{f.type}</Badge>
                {f.merchant.isSystem && <Badge variant="brand">Sistem</Badge>}
                {f.lastStatus && (
                  <Badge variant={f.lastStatus === "SUCCESS" ? "save" : f.lastStatus === "FAILED" ? "rise" : "muted"}>
                    {f.lastStatus}
                  </Badge>
                )}
                {!f.enabled && <Badge variant="rise">Pasif</Badge>}
              </div>
              <span className="text-sm text-[var(--muted)]">
                {f.itemCount} ürün · {f.lastRunAt ? formatDate(f.lastRunAt) : "hiç çalışmadı"}
              </span>
            </div>
            <div className="mt-1 truncate text-xs text-[var(--muted)]">{f.merchant.name} · {f.url ?? "yerel demo dosya"}</div>
            {f.lastError && <p className="mt-1 text-xs text-[var(--rise)]">Hata: {f.lastError}</p>}
            {f.runs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                {f.runs.map((r) => (
                  <span key={r.id} className="rounded border border-[var(--border)] px-2 py-0.5">
                    {r.status} · +{r.itemsCreated}/~{r.itemsUpdated} · {formatDate(r.startedAt)}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
