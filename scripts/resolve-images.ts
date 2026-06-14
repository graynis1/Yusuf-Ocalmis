/**
 * Her katalog ürünü için Wikimedia Commons'tan GERÇEK, temiz ürün görseli çözer.
 * Doğrulama: 200 + image content-type + pdf/doküman değil. Sonuç data/catalog-images.json.
 * Çalıştır: npx tsx scripts/resolve-images.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { CATALOG } from "../data/catalog";

const UA = "FiyatbulBot/1.0 (price comparison demo; contact@fiyatbul.com)";

// arama sorgusu: marka + model, depolama/ölçü/Türkçe jenerik kelimeleri at
function buildQuery(brand: string, model: string): string {
  let m = model
    .replace(/\d+\s?(GB|TB|ml|mm|inç|kg|L|W|mAh|nesil|kişilik)\b/gi, "")
    .replace(/\b(Spor Ayakkabı|Koşu Ayakkabısı|Sneaker|Ayakkabı|Süpürge|Dikey|Robot|Sıcak Hava Fritözü|Fritöz|Çamaşır Makinesi|Kurutmalı|Bulaşık Makinesi|Buzdolabı|No Frost|Gardırop|Çay Makinesi|Espresso Makinesi|Blender Seti|Yüz Kremi|Güneş Kremi|Yaşlanma Karşıtı|Tam Otomatik)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${brand} ${m}`.trim();
}

interface ResolveResult {
  url: string | null;
  query: string;
  width?: number;
  height?: number;
}

async function resolve(brand: string, model: string): Promise<ResolveResult> {
  const query = buildQuery(brand, model);
  const api =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json" +
    "&generator=search&gsrnamespace=6&gsrlimit=6" +
    `&gsrsearch=${encodeURIComponent(query)}` +
    "&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=800";
  try {
    const res = await fetch(api, { headers: { "User-Agent": UA } });
    if (!res.ok) return { url: null, query };
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { imageinfo?: { thumburl?: string; url?: string; mime?: string; width?: number; height?: number }[] }> };
    };
    const pages = data.query?.pages;
    if (!pages) return { url: null, query };
    // en uygun görseli seç: image/* mime, pdf/svg-doküman değil, makul boyut
    const candidates = Object.values(pages)
      .map((p) => p.imageinfo?.[0])
      .filter((ii): ii is NonNullable<typeof ii> => Boolean(ii?.thumburl));
    for (const ii of candidates) {
      const mime = ii.mime ?? "";
      const url = ii.thumburl!;
      if (!mime.startsWith("image/")) continue;
      if (/\.pdf|\.tif|page1-/i.test(url)) continue;
      if (/(logo|icon|map|diagram|chart|flag)/i.test(url)) continue;
      return { url, query, width: ii.width, height: ii.height };
    }
    return { url: null, query };
  } catch {
    return { url: null, query };
  }
}

async function main() {
  const out: Record<number, string> = {};
  let hit = 0;
  for (let i = 0; i < CATALOG.length; i++) {
    const it = CATALOG[i];
    const r = await resolve(it.brand, it.model);
    if (r.url) {
      out[i] = r.url;
      hit++;
      console.log(`✓ [${i}] ${it.brand} ${it.model}  →  ${r.url.split("/").pop()}`);
    } else {
      console.log(`✗ [${i}] ${it.brand} ${it.model}  (sorgu: ${r.query})`);
    }
    await new Promise((r) => setTimeout(r, 250)); // nazik ol
  }
  const file = path.join(process.cwd(), "data", "catalog-images.json");
  await fs.writeFile(file, JSON.stringify(out, null, 2), "utf-8");
  console.log(`\n${hit}/${CATALOG.length} ürün için gerçek görsel çözüldü → ${file}`);
}

main();
