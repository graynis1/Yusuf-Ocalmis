import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/server/merchant";
import { getClickSeries, getTopClickedProducts } from "@/server/analytics";
import { MiniChart } from "@/components/dashboard/mini-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function MerchantAnalyticsPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) redirect("/satici/kayit");

  const [series, topProducts] = await Promise.all([
    getClickSeries(30, merchant.id),
    getTopClickedProducts(merchant.id, 10),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Analitik</h1>

      <div className="rounded-lg border border-[var(--border)] bg-card p-5">
        <h2 className="mb-4 font-display text-lg font-bold">Tıklama zaman serisi (30 gün)</h2>
        <MiniChart data={series} label="Tıklama" />
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-bold">En çok tıklanan ürünler</h2>
        <div className="rounded-lg border border-[var(--border)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Tıklama</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((p) => (
                <TableRow key={p.slug}>
                  <TableCell>
                    <Link href={`/urun/${p.slug}`} className="text-ink hover:text-[var(--brand)]">{p.title}</Link>
                  </TableCell>
                  <TableCell className="tabular">{p.clicks}</TableCell>
                </TableRow>
              ))}
              {topProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="py-8 text-center text-sm text-[var(--muted)]">
                    Henüz tıklama verisi yok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
