import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SponsoredToggle } from "@/components/admin/sponsored-toggle";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function AdminSponsoredPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();
  // sponsorlular önce, sonra arama sonucu
  const offers = await prisma.offer.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" } } : { isSponsored: true },
    orderBy: [{ isSponsored: "desc" }, { updatedAt: "desc" }],
    take: 60,
    include: { merchant: { select: { name: true } } },
  });

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold">Sponsorlu yerleşimler</h1>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Sponsorlu teklifler arama ve teklif tablosunda "Sponsorlu" etiketiyle üstte gösterilir.
      </p>
      <form className="mb-4 max-w-sm">
        <Input name="q" defaultValue={q} placeholder="Teklif ara (boşsa mevcut sponsorlular)…" />
      </form>
      <div className="rounded-lg border border-[var(--border)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teklif</TableHead>
              <TableHead>Mağaza</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Sponsorlu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="max-w-xs">
                  <span className="line-clamp-1">{o.title}</span>
                  {o.isSponsored && <Badge variant="sponsored" className="mt-1">Sponsorlu</Badge>}
                </TableCell>
                <TableCell className="text-sm">{o.merchant.name}</TableCell>
                <TableCell className="tabular">{formatPrice(Number(o.price))}</TableCell>
                <TableCell>
                  <SponsoredToggle offerId={o.id} value={o.isSponsored} />
                </TableCell>
              </TableRow>
            ))}
            {offers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-[var(--muted)]">
                  Sonuç yok.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
