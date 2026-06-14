import Papa from "papaparse";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { FeedSource } from "@prisma/client";
import type { FeedAdapter, MappingConfig, RawProduct } from "../types";
import { mapRecord } from "../mapper";

async function loadContent(source: FeedSource): Promise<string> {
  if (!source.url) throw new Error("CSV feed: url yok");
  if (source.url.startsWith("file://") || source.url.startsWith("data/")) {
    const rel = source.url.replace("file://", "");
    return fs.readFile(path.join(process.cwd(), rel), "utf-8");
  }
  const res = await fetch(source.url, { headers: { "User-Agent": "FiyatbulBot/1.0" } });
  if (!res.ok) throw new Error(`CSV feed HTTP ${res.status}`);
  return res.text();
}

export const csvAdapter: FeedAdapter = {
  async *fetch(source: FeedSource): AsyncIterable<RawProduct> {
    const config = source.mappingConfig as unknown as MappingConfig;
    const content = await loadContent(source);
    const result = Papa.parse<Record<string, unknown>>(content, {
      header: true,
      skipEmptyLines: true,
    });
    for (const rec of result.data) {
      const mapped = mapRecord(rec, config);
      if (mapped) yield mapped;
    }
  },
};
