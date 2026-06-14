import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/server/merchant";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function MerchantListingsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const merchant = await getCurrentMerchant();
  if (!merchant) redirect("/satici/kayit");

  const q = searchParams.q?.trim();
  const offers = await prisma.offer.findMany({
    where: {
      merchantId: merchant.id,
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: { product: { select: { slug: true } } },
  });

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold">Listingler</h1>
      <form className="mb-4 max-w-sm">
        <Input name="q" defaultValue={q} placeholder="Listing ara…" />
      </form>
      <div className="rounded-lg border border-[var(--border)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ürün</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Eşleşme</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="max-w-xs">
                  {o.product ? (
                    <Link href={`/urun/${o.product.slug}`} className="line-clamp-1 text-ink hover:text-[var(--brand)]">
                      {o.title}
                    </Link>
                  ) : (
                    <span className="line-clamp-1">{o.title}</span>
                  )}
                </TableCell>
                <TableCell className="tabular">{formatPrice(Number(o.price))}</TableCell>
                <TableCell>
                  <Badge variant={o.inStock ? "save" : "rise"}>{o.inStock ? "Var" : "Yok"}</Badge>
                </TableCell>
                <TableCell>
                  {o.matchMethod ? <Badge variant="muted">{o.matchMethod}</Badge> : <span className="text-xs text-[var(--muted)]">—</span>}
                </TableCell>
              </TableRow>
            ))}
            {offers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-[var(--muted)]">
                  Listing bulunamadı. Feed bağladığında ürünlerin burada görünecek.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
