import { XMLParser } from "fast-xml-parser";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { FeedSource } from "@prisma/client";
import type { FeedAdapter, MappingConfig, RawProduct } from "../types";
import { mapRecord } from "../mapper";
import { GOOGLE_SHOPPING_MAPPING } from "./googleShopping.adapter";

/**
 * DEMO adapter: repoya gömülü data/demo-feeds/*.xml dosyalarını okur.
 * Dosyalar Google Shopping RSS biçiminde — ilk açılışta site DOLU gelsin diye.
 */
export const demoAdapter: FeedAdapter = {
  async *fetch(source: FeedSource): AsyncIterable<RawProduct> {
    const rel = (source.url ?? "").replace("file://", "");
    if (!rel) throw new Error("DEMO feed: yerel dosya yolu yok");
    const filePath = path.join(process.cwd(), rel);
    const content = await fs.readFile(filePath, "utf-8");
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", trimValues: true });
    const parsed = parser.parse(content);
    const items = parsed?.rss?.channel?.item;
    const list = Array.isArray(items) ? items : items ? [items] : [];
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
