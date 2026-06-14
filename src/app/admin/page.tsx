import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getClickSeries } from "@/server/analytics";
import { StatCard } from "@/components/dashboard/stat-card";
import { MiniChart } from "@/components/dashboard/mini-chart";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, offers, merchants, clicks, pendingMerchants, pendingMatches, series, recentRuns] =
    await Promise.all([
      prisma.product.count(),
      prisma.offer.count(),
      prisma.merchant.count(),
      prisma.click.count(),
      prisma.merchant.count({ where: { status: "PENDING" } }),
      prisma.matchReview.count({ where: { status: "PENDING" } }),
      getClickSeries(30),
      prisma.ingestionRun.findMany({
        orderBy: { startedAt: "desc" },
        take: 8,
        include: { feedSource: { select: { name: true } } },
      }),
    ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Genel bakış</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ürün" value={products} />
        <StatCard label="Teklif" value={offers} />
        <StatCard label="Mağaza" value={merchants} />
        <StatCard label="Toplam tıklama" value={clicks} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/magazalar" className="rounded-lg border border-[var(--border)] bg-card px-4 py-3 text-sm">
          Onay bekleyen mağaza: <span className="font-bold">{pendingMerchants}</span>
        </Link>
        <Link href="/admin/eslestirme" className="rounded-lg border border-[var(--border)] bg-card px-4 py-3 text-sm">
          Eşleştirme kuyruğu: <span className="font-bold">{pendingMatches}</span>
        </Link>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-card p-5">
        <h2 className="mb-4 font-display text-lg font-bold">Tıklama (30 gün)</h2>
        <MiniChart data={series} label="Tıklama" />
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold">Son ingestion çalışmaları</h2>
        <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)]">
          {recentRuns.map((r) => (
            <li key={r.id} className="flex items-center justify-between p-3 text-sm">
              <span>{r.feedSource.name}</span>
              <span className="flex items-center gap-3 text-[var(--muted)]">
                <span>{r.itemsCreated}+ / {r.itemsUpdated}~</span>
                <span>{formatDate(r.startedAt)}</span>
                <Badge variant={r.status === "SUCCESS" ? "save" : r.status === "FAILED" ? "rise" : "muted"}>{r.status}</Badge>
              </span>
            </li>
          ))}
          {recentRuns.length === 0 && (
            <li className="p-6 text-center text-sm text-[var(--muted)]">Henüz ingestion çalışması yok.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
