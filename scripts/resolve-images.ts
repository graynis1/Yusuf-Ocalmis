/**
 * Her katalog ürünü için Wikipedia makale ANA görselini (lead image) çözer — doğru ve temiz.
 * Sıra: EN wiki → TR wiki. Doğrulama: thumbnail var + image. Sonuç: data/catalog-images.json
 * Çalıştır: npx tsx scripts/resolve-images.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { CATALOG, wikiTitleFor } from "../data/catalog";

const UA = "FiyatbulBot/1.0 (price comparison demo; contact@fiyatbul.com)";

async function leadImage(title: string, lang: "en" | "tr"): Promise<string | null> {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      thumbnail?: { source?: string };
      originalimage?: { source?: string };
      type?: string;
    };
    const src = j.originalimage?.source ?? j.thumbnail?.source;
    if (!src) return null;
    if (/\.(svg)(\.png)?$/i.test(src) && /logo/i.test(src)) return null; // logo svg'leri ele
    if (/\.pdf|\.ogv|\.webm/i.test(src)) return null;
    // makul boyuta getir (genişlik 600)
    return src.replace(/\/\d+px-/, "/600px-");
  } catch {
    return null;
  }
}

async function main() {
  const out: Record<number, string> = {};
  let hit = 0;
  for (let i = 0; i < CATALOG.length; i++) {
    const it = CATALOG[i];
    const title = wikiTitleFor(i);
    let img = await leadImage(title, "en");
    if (!img) img = await leadImage(title, "tr");
    if (img) {
      out[i] = img;
      hit++;
      console.log(`✓ [${i}] ${it.brand} ${it.model}  →  (${title}) ${img.split("/").pop()}`);
    } else {
      console.log(`✗ [${i}] ${it.brand} ${it.model}  (wiki: ${title})`);
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  const file = path.join(process.cwd(), "data", "catalog-images.json");
  await fs.writeFile(file, JSON.stringify(out, null, 2), "utf-8");
  console.log(`\n${hit}/${CATALOG.length} gerçek görsel → ${file}`);
}

main();
