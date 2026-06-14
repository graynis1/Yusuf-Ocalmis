/**
 * Demo feed üretici — GERÇEK katalogdan (data/catalog.ts) besler.
 * ~10 sistem mağazası, paylaşılan GTIN ile çoklu satıcı teklifi, ±%10 fiyat farkı.
 * Görseller loremflickr ile anahtar kelimeye uygun gerçek foto (ürün başına sabit).
 * Çalıştır: npx tsx scripts/generate-demo-feeds.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { CATALOG, imageFor, catalogGtin } from "../data/catalog";

const STORES = [
  "TeknoMarket", "MegaElektronik", "EvAlışveriş", "TrendStore", "FiyatDeposu",
  "DijitalDünya", "EkonomikPazar", "HızlıAlış", "OutletCity", "GurmePazar",
];

const gtinFor = catalogGtin;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

type Built = { gtin: string; mpn: string; title: string; brand: string; product_type: string; basePrice: number; image: string | null };

function buildCatalog(): Built[] {
  return CATALOG.map((it, i) => ({
    gtin: gtinFor(i),
    mpn: `${it.brand.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X")}-${1000 + i}`,
    title: `${it.brand} ${it.model}`,
    brand: it.brand,
    product_type: it.categoryPath,
    basePrice: it.price,
    image: imageFor(i),
  }));
}

function itemXml(it: Built, priceFactor: number): string {
  // güncel satış fiyatı (mağazaya göre ±%). İndirimliyse eski (üstü çizili) daha yüksek.
  const current = Math.round((it.basePrice * priceFactor) / 10) * 10;
  const hasSale = Math.random() < 0.5;
  const oldPrice = hasSale ? Math.round((current * (1.08 + Math.random() * 0.25)) / 10) * 10 : null;
  const avail = Math.random() < 0.9 ? "in stock" : "out of stock";
  // Bizim mapper: price ← g:price (GÜNCEL), oldPrice ← g:sale_price (ESKİ/üstü çizili)
  return `  <item>
    <g:id>${it.gtin}</g:id>
    <title>${esc(it.title)}</title>
    <link>https://example-store.com/p/${it.gtin}</link>
    <g:price>${current} TRY</g:price>
${oldPrice ? `    <g:sale_price>${oldPrice} TRY</g:sale_price>` : ""}
${it.image ? `    <g:image_link>${esc(it.image)}</g:image_link>` : ""}
    <g:brand>${esc(it.brand)}</g:brand>
    <g:gtin>${it.gtin}</g:gtin>
    <g:mpn>${esc(it.mpn)}</g:mpn>
    <g:product_type>${esc(it.product_type)}</g:product_type>
    <g:availability>${avail}</g:availability>
  </item>`;
}

async function main() {
  const catalog = buildCatalog();
  const outDir = path.join(process.cwd(), "data", "demo-feeds");
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  for (let s = 0; s < STORES.length; s++) {
    const store = STORES[s];
    // her mağaza katalogun %70-85'ini taşısın → ürün başına çok satıcı (cimri etkisi)
    const ratio = 0.7 + Math.random() * 0.15;
    const subset = catalog.filter(() => Math.random() < ratio);
    const items = subset.map((it) => itemXml(it, 0.92 + Math.random() * 0.16)).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${store} Ürün Feed</title>
  <link>https://example-store.com</link>
  <description>Demo feed — FİYATBUL</description>
${items}
</channel>
</rss>`;
    const slug = store
      .toLowerCase()
      .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
      .replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    await fs.writeFile(path.join(outDir, `${slug}.xml`), xml, "utf-8");
    console.log(`✓ ${slug}.xml — ${subset.length} ürün`);
  }
  console.log(`\nKatalog: ${catalog.length} gerçek ürün, ${STORES.length} mağaza.`);
}

main();
