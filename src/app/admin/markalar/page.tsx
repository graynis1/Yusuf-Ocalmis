import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold">Markalar</h1>
      <p className="mb-4 text-sm text-[var(--muted)]">{brands.length} marka</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/marka/${b.slug}`}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-card px-4 py-3 text-sm hover:border-[var(--brand)]"
          >
            <span className="font-medium">{b.name}</span>
            <span className="tabular text-[var(--muted)]">{b._count.products}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
