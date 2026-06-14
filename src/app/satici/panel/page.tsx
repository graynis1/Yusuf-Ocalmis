import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/server/merchant";
import { getMerchantStats, getClickSeries } from "@/server/analytics";
import { formatPrice } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { MiniChart } from "@/components/dashboard/mini-chart";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function MerchantDashboard() {
  const merchant = await getCurrentMerchant();
  if (!merchant) redirect("/satici/kayit");

  const [stats, series] = await Promise.all([
    getMerchantStats(merchant.id),
    getClickSeries(30, merchant.id),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{merchant.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={merchant.status === "APPROVED" ? "save" : "muted"}>
              {merchant.status === "APPROVED" ? "Onaylı" : merchant.status === "PENDING" ? "Onay bekliyor" : "Askıda"}
            </Badge>
            <Badge variant="brand">{merchant.tier}</Badge>
          </div>
        </div>
      </div>

      {merchant.status === "PENDING" && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Başvurun inceleniyor. Onaylandığında feed bağlayıp ürünlerini listeleyebileceksin.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Listing sayısı" value={stats.listings} />
        <StatCard label="Tıklama (30 gün)" value={stats.clicks30} />
        <StatCard label="Toplam tıklama" value={stats.totalClicks} />
        <StatCard label="Tahmini komisyon" value={formatPrice(stats.estCommission)} hint="Son 30 gün, kaba tahmin" />
      </div>

      <div className="mt-8 rounded-lg border border-[var(--border)] bg-card p-5">
        <h2 className="mb-4 font-display text-lg font-bold">Son 30 gün tıklamalar</h2>
        <MiniChart data={series} label="Tıklama" />
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/satici/feeds" className="text-sm font-medium text-[var(--brand)]">Feed bağla →</Link>
        <Link href="/satici/analytics" className="text-sm font-medium text-[var(--brand)]">Analitiği gör →</Link>
      </div>
    </div>
  );
}
