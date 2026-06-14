import { searchProducts } from "@/server/search/search";
import { parseSearchParams } from "@/lib/search-params";
import { ProductGrid } from "@/components/product/product-grid";
import { FacetPanel } from "@/components/search/facet-panel";
import { SortSelect } from "@/components/search/sort-select";
import { Pagination } from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const params = parseSearchParams(searchParams);
  let result;
  try {
    result = await searchProducts(params);
  } catch {
    result = { items: [], total: 0, page: 1, pageSize: 24, facets: { brands: [], categories: [], attributes: {}, priceRange: null } };
  }

  const q = params.q;

  function makeHref(page: number) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v === undefined) continue;
      (Array.isArray(v) ? v : [v]).forEach((val) => sp.append(k, val));
    }
    sp.set("page", String(page));
    return `/ara?${sp.toString()}`;
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">
          {q ? `"${q}" için sonuçlar` : "Tüm ürünler"}
        </h1>
        <p className="text-sm text-[var(--muted)]">{result.total} ürün bulundu</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <FacetPanel facets={result.facets} />
        </div>
        <div>
          <div className="mb-4 flex items-center justify-end">
            <SortSelect />
          </div>
          <ProductGrid products={result.items} />
          <Pagination
            page={result.page}
            total={result.total}
            pageSize={result.pageSize}
            makeHref={makeHref}
          />
        </div>
      </div>
    </div>
  );
}
