import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { searchProducts } from "@/server/search/search";
import { parseSearchParams } from "@/lib/search-params";
import { ProductGrid } from "@/components/product/product-grid";
import { FacetPanel } from "@/components/search/facet-panel";
import { SortSelect } from "@/components/search/sort-select";
import { Pagination } from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string[] };
  searchParams: SP;
}) {
  const slug = params.slug[params.slug.length - 1];
  let category;
  try {
    category = await prisma.category.findUnique({ where: { slug } });
  } catch {
    category = null;
  }
  if (!category) notFound();

  // breadcrumb: materialized path'ten ata kategorileri çöz
  const ancestorSlugs = category.path.split("/").filter(Boolean);
  let ancestors: { name: string; slug: string }[] = [];
  try {
    const found = await prisma.category.findMany({
      where: { slug: { in: ancestorSlugs } },
      select: { name: true, slug: true, path: true },
    });
    ancestors = ancestorSlugs
      .map((s) => found.find((f) => f.slug === s))
      .filter((x): x is { name: string; slug: string; path: string } => Boolean(x));
  } catch {
    ancestors = [{ name: category.name, slug: category.slug }];
  }

  const searchP = parseSearchParams(searchParams, { categorySlug: slug });
  let result;
  try {
    result = await searchProducts(searchP);
  } catch {
    result = { items: [], total: 0, page: 1, pageSize: 24, facets: { brands: [], categories: [], attributes: {}, priceRange: null } };
  }

  function makeHref(page: number) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v === undefined) continue;
      (Array.isArray(v) ? v : [v]).forEach((val) => sp.append(k, val));
    }
    sp.set("page", String(page));
    return `/kategori/${slug}?${sp.toString()}`;
  }

  return (
    <div className="container py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-[var(--muted)]" aria-label="breadcrumb">
        <Link href="/" className="hover:text-ink">Ana sayfa</Link>
        {ancestors.map((a) => (
          <span key={a.slug} className="flex items-center gap-1">
            <ChevronRight className="size-3" />
            <Link href={`/kategori/${a.slug}`} className="hover:text-ink">{a.name}</Link>
          </span>
        ))}
      </nav>

      <h1 className="mb-6 font-display text-2xl font-bold">{category.name}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <FacetPanel facets={result.facets} />
        </div>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">{result.total} ürün</p>
            <SortSelect />
          </div>
          <ProductGrid products={result.items} />
          <Pagination page={result.page} total={result.total} pageSize={result.pageSize} makeHref={makeHref} />
        </div>
      </div>
    </div>
  );
}
