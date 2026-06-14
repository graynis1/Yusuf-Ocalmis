/**
 * Her katalog ürünü için Wikipedia makale ana görselini (REST summary thumbnail) çözer.
 * URL OLDUĞU GİBİ kullanılır (geçerli CDN thumb). Sıra: EN → TR. Sonuç: data/catalog-images.json
 * Çalıştır: npx tsx scripts/resolve-images.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { CATALOG, wikiTitleFor } from "../data/catalog";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36 FiyatbulBot/1.0";

async function leadImage(title: string, lang: "en" | "tr"): Promise<string | null> {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const j = (await res.json()) as { thumbnail?: { source?: string }; originalimage?: { source?: string; width?: number } };
    const thumb = j.thumbnail?.source;
    if (!thumb) return null;
    if (/logo/i.test(thumb) && /\.svg/i.test(thumb)) return null;
    // SVG raster thumb'larını büyütme; olduğu gibi kullan (geçerli). Diğerlerini 500px'e çek.
    if (/\.svg\.png$/i.test(thumb)) return thumb;
    return thumb.replace(/\/\d+px-/, "/500px-");
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
      console.log(`✓ [${i}] ${it.brand} ${it.model}  →  ${img.split("/").pop()}`);
    } else {
      console.log(`✗ [${i}] ${it.brand} ${it.model}  (wiki: ${title})`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  const file = path.join(process.cwd(), "data", "catalog-images.json");
  await fs.writeFile(file, JSON.stringify(out, null, 2), "utf-8");
  console.log(`\n${hit}/${CATALOG.length} gerçek görsel → ${file}`);
}

main();
