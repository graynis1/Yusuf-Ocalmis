import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const cats = await prisma.category.findMany({
    orderBy: { path: "asc" },
    include: { _count: { select: { products: true } } },
  });
  const categories = cats.map((c) => ({
    id: c.id,
    name: c.name,
    path: c.path,
    parentId: c.parentId,
    productCount: c._count.products,
  }));

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold">Kategori taksonomisi</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Ağaç yapısını düzenle. Materialized path otomatik bakım yapılır.</p>
      <CategoryManager categories={categories} />
    </div>
  );
}
