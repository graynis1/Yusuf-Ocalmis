import { unstable_cache } from "next/cache";
import {
  getTopDeals,
  getTrendingProducts,
  getCategoryTiles,
  getCategoryRails,
  getTopBrands,
  getTopCategories,
} from "./products";

/**
 * Ana sayfa ve header için cache'li veri okumaları.
 * Katalog saatlik feed ile güncellendiği için 5 dk revalidate yeterli;
 * her gezinmede Neon'a sorgu atmaz → geçişler anında hissedilir.
 * Feed ingest/snapshot sonrası `revalidateTag("catalog")` ile tazelenebilir.
 */
const opts = { revalidate: 300, tags: ["catalog"] };

export const getTopDealsCached = unstable_cache(getTopDeals, ["home:deals"], opts);
export const getTrendingCached = unstable_cache(getTrendingProducts, ["home:trending"], opts);
export const getCategoryTilesCached = unstable_cache(getCategoryTiles, ["home:tiles"], opts);
export const getCategoryRailsCached = unstable_cache(getCategoryRails, ["home:rails"], opts);
export const getTopBrandsCached = unstable_cache(getTopBrands, ["home:brands"], opts);
export const getNavCategoriesCached = unstable_cache(getTopCategories, ["nav:categories"], {
  revalidate: 900,
  tags: ["catalog"],
});
