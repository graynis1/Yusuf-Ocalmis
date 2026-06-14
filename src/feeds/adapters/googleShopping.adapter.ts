import { XMLParser } from "fast-xml-parser";
import type { FeedSource } from "@prisma/client";
import type { FeedAdapter, MappingConfig, RawProduct } from "../types";
import { mapRecord } from "../mapper";

/**
 * Google Shopping / Merchant Center RSS 2.0 feed adapter.
 * g: namespace alanlarını kanonik şemaya sabit preset ile çevirir.
 */
export const GOOGLE_SHOPPING_MAPPING: MappingConfig = {
  rootPath: "rss.channel.item",
  defaultCurrency: "TRY",
  fields: {
    externalId: "g:id",
    title: "title",
    url: "link",
    price: "g:price",
    oldPrice: "g:sale_price",
    imageUrl: "g:image_link",
    brand: "g:brand",
    gtin: "g:gtin",
    mpn: "g:mpn",
    category: "g:product_type",
    inStock: "g:availability",
  },
  attributeFields: ["g:color", "g:size", "g:material", "g:gender"],
};

export const googleShoppingAdapter: FeedAdapter = {
  async *fetch(source: FeedSource): AsyncIterable<RawProduct> {
    if (!source.url) throw new Error("Google Shopping feed: url yok");
    const res = await fetch(source.url, { headers: { "User-Agent": "FiyatbulBot/1.0" } });
    if (!res.ok) throw new Error(`Google Shopping HTTP ${res.status}`);
    const content = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", trimValues: true });
    const parsed = parser.parse(content);
    const items = parsed?.rss?.channel?.item;
    const list = Array.isArray(items) ? items : items ? [items] : [];
    // mappingConfig boşsa preset kullan
    const config =
      source.mappingConfig && Object.keys(source.mappingConfig).length
        ? (source.mappingConfig as unknown as MappingConfig)
        : GOOGLE_SHOPPING_MAPPING;
    for (const rec of list) {
      const mapped = mapRecord(rec as Record<string, unknown>, config);
      if (mapped) yield mapped;
    }
  },
};
