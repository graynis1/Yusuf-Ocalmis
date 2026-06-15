import type { SearchParams, SortKey } from "@/server/search/search";

type RawParams = Record<string, string | string[] | undefined>;

function arr(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/** URL searchParams -> searchProducts parametreleri. */
export function parseSearchParams(
  raw: RawParams,
  overrides: Partial<SearchParams> = {}
): SearchParams {
  const attrs: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith("attr_")) {
      attrs[key.slice(5)] = arr(value);
    }
  }
  const min = raw.min ? Number(raw.min) : undefined;
  const max = raw.max ? Number(raw.max) : undefined;

  return {
    q: typeof raw.q === "string" ? raw.q : undefined,
    categorySlug: typeof raw.kategori === "string" ? raw.kategori : undefined,
    brandSlugs: arr(raw.marka),
    min: Number.isFinite(min) ? min : undefined,
    max: Number.isFinite(max) ? max : undefined,
    attrs: Object.keys(attrs).length ? attrs : undefined,
    onlyDeals: raw.indirim === "1",
    sort: (typeof raw.sort === "string" ? raw.sort : undefined) as SortKey | undefined,
    page: raw.page ? Math.max(1, Number(raw.page)) : 1,
    ...overrides,
  };
}
