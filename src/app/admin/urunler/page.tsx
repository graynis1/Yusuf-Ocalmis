import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();
  const products = await prisma.product.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" } } : {},
    orderBy: { offerCount: "desc" },
    take: 100,
    include: { brand: { select: { name: true } }, category: { select: { name: true } } },
  });

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold">Ürünler</h1>
      <form className="mb-4 max-w-sm">
        <Input name="q" defaultValue={q} placeholder="Ürün ara…" />
      </form>
      <div className="rounded-lg border border-[var(--border)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ürün</TableHead>
              <TableHead>Marka</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>En düşük</TableHead>
              <TableHead>Teklif</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-xs">
                  <Link href={`/urun/${p.slug}`} className="line-clamp-1 text-ink hover:text-[var(--brand)]">{p.title}</Link>
                </TableCell>
                <TableCell className="text-sm">{p.brand?.name ?? "—"}</TableCell>
                <TableCell className="text-sm">{p.category.name}</TableCell>
                <TableCell className="tabular">{formatPrice(p.lowestPrice ? Number(p.lowestPrice) : null)}</TableCell>
                <TableCell className="tabular">{p.offerCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
