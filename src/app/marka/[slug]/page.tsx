import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { searchProducts } from "@/server/search/search";
import { parseSearchParams } from "@/lib/search-params";
import { ProductGrid } from "@/components/product/product-grid";
import { SortSelect } from "@/components/search/sort-select";
import { Pagination } from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SP;
}) {
  const brand = await prisma.brand.findUnique({ where: { slug: params.slug } }).catch(() => null);
  if (!brand) notFound();

  const sp = parseSearchParams(searchParams, { brandSlugs: [params.slug] });
  const result = await searchProducts(sp).catch(() => ({
    items: [], total: 0, page: 1, pageSize: 24,
    facets: { brands: [], categories: [], attributes: {}, priceRange: null },
  }));

  function makeHref(page: number) {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v === undefined) continue;
      (Array.isArray(v) ? v : [v]).forEach((val) => u.append(k, val));
    }
    u.set("page", String(page));
    return `/marka/${params.slug}?${u.toString()}`;
  }

  return (
    <div className="container py-8">
      <h1 className="mb-1 font-display text-2xl font-bold">{brand.name}</h1>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">{result.total} ürün</p>
        <SortSelect />
      </div>
      <ProductGrid products={result.items} />
      <Pagination page={result.page} total={result.total} pageSize={result.pageSize} makeHref={makeHref} />
    </div>
  );
}
