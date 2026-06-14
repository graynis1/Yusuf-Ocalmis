import { XMLParser } from "fast-xml-parser";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { FeedSource } from "@prisma/client";
import type { FeedAdapter, MappingConfig, RawProduct } from "../types";
import { mapRecord } from "../mapper";

function getByPath(obj: unknown, dotted?: string): unknown {
  if (!dotted) return obj;
  return dotted.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

async function loadContent(source: FeedSource): Promise<string> {
  // url yoksa (DEMO) yerel dosyadan okunur — runner DEMO'yu ayrı yönetir.
  if (!source.url) throw new Error("XML feed: url yok");
  if (source.url.startsWith("file://") || source.url.startsWith("data/")) {
    const rel = source.url.replace("file://", "");
    return fs.readFile(path.join(process.cwd(), rel), "utf-8");
  }
  const res = await fetch(source.url, { headers: { "User-Agent": "FiyatbulBot/1.0" } });
  if (!res.ok) throw new Error(`XML feed HTTP ${res.status}`);
  return res.text();
}

export const xmlAdapter: FeedAdapter = {
  async *fetch(source: FeedSource): AsyncIterable<RawProduct> {
    const config = source.mappingConfig as unknown as MappingConfig;
    const content = await loadContent(source);
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      trimValues: true,
    });
    const parsed = parser.parse(content);
    const node = getByPath(parsed, config.rootPath);
    const list = Array.isArray(node) ? node : node ? [node] : [];
    for (const rec of list) {
      const mapped = mapRecord(rec as Record<string, unknown>, config);
      if (mapped) yield mapped;
    }
  },
};
