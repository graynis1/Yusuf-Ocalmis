/**
 * Demo feed üretici: data/demo-feeds/*.xml dosyalarını (Google Shopping RSS) yazar.
 * ~10 sistem mağazası, paylaşılan GTIN'lerle çoklu satıcı teklifi.
 * Çalıştır: npx tsx scripts/generate-demo-feeds.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";

type Cat = { name: string; product_type: string; brands: string[]; bases: { name: string; attrs?: Record<string, string> }[]; priceMin: number; priceMax: number };

const CATEGORIES: Cat[] = [
  {
    name: "Akıllı Telefon",
    product_type: "Elektronik > Telefon > Akıllı Telefon",
    brands: ["Apple", "Samsung", "Xiaomi", "Oppo", "Realme", "Huawei"],
    priceMin: 7000,
    priceMax: 85000,
    bases: [
      { name: "iPhone 15 Pro Max 256GB", attrs: { hafiza: "256GB", renk: "Titanyum" } },
      { name: "iPhone 15 128GB", attrs: { hafiza: "128GB" } },
      { name: "iPhone 14 128GB", attrs: { hafiza: "128GB" } },
      { name: "Galaxy S24 Ultra 512GB", attrs: { hafiza: "512GB" } },
      { name: "Galaxy S24 256GB", attrs: { hafiza: "256GB" } },
      { name: "Galaxy A55 128GB", attrs: { hafiza: "128GB" } },
      { name: "Redmi Note 13 Pro 256GB", attrs: { hafiza: "256GB" } },
      { name: "Xiaomi 14 256GB", attrs: { hafiza: "256GB" } },
      { name: "Reno 11 256GB", attrs: { hafiza: "256GB" } },
      { name: "Realme 12 Pro 256GB", attrs: { hafiza: "256GB" } },
    ],
  },
  {
    name: "Dizüstü Bilgisayar",
    product_type: "Elektronik > Bilgisayar > Dizüstü",
    brands: ["Apple", "Asus", "Lenovo", "HP", "Monster", "Casper"],
    priceMin: 15000,
    priceMax: 120000,
    bases: [
      { name: "MacBook Air M3 13 inç 256GB" },
      { name: "MacBook Pro 14 inç M3 512GB" },
      { name: "ROG Strix G16 RTX 4060" },
      { name: "Vivobook 15 i5 16GB" },
      { name: "ThinkPad E14 Ryzen 5" },
      { name: "IdeaPad Slim 3 i7" },
      { name: "Victus 15 RTX 3050" },
      { name: "Pavilion 14 i5 512GB" },
      { name: "Abra A5 V20 i7 RTX 4050" },
      { name: "Excalibur G870 i5" },
    ],
  },
  {
    name: "Beyaz Eşya",
    product_type: "Ev & Yaşam > Beyaz Eşya",
    brands: ["Arçelik", "Bosch", "Siemens", "Vestel", "Samsung", "LG"],
    priceMin: 9000,
    priceMax: 65000,
    bases: [
      { name: "No Frost Buzdolabı 540 Litre" },
      { name: "Çamaşır Makinesi 9 kg 1200 Devir" },
      { name: "Bulaşık Makinesi 6 Programlı" },
      { name: "Kurutmalı Çamaşır Makinesi 8 kg" },
      { name: "Ankastre Fırın Multifonksiyon" },
      { name: "Solo Mikrodalga Fırın 25 Litre" },
      { name: "Derin Dondurucu 7 Çekmece" },
      { name: "Gardırop Tipi Buzdolabı 600 Litre" },
    ],
  },
  {
    name: "Televizyon",
    product_type: "Elektronik > TV & Ses > Televizyon",
    brands: ["Samsung", "LG", "Vestel", "Philips", "TCL", "Sony"],
    priceMin: 8000,
    priceMax: 95000,
    bases: [
      { name: "55 inç 4K UHD Smart TV", attrs: { ekran: "55inch" } },
      { name: "65 inç QLED 4K Smart TV", attrs: { ekran: "65inch" } },
      { name: "50 inç 4K Google TV", attrs: { ekran: "50inch" } },
      { name: "75 inç OLED 4K TV", attrs: { ekran: "75inch" } },
      { name: "43 inç Full HD Smart TV", attrs: { ekran: "43inch" } },
      { name: "Nano Cell 65 inç 4K TV", attrs: { ekran: "65inch" } },
    ],
  },
  {
    name: "Kozmetik",
    product_type: "Kozmetik & Kişisel Bakım > Parfüm",
    brands: ["Loreal", "Maybelline", "Nivea", "Garnier", "Avon", "Clinique"],
    priceMin: 150,
    priceMax: 4500,
    bases: [
      { name: "EDP Kadın Parfüm 100ml", attrs: { hacim: "100ml" } },
      { name: "Erkek Parfüm EDT 100ml", attrs: { hacim: "100ml" } },
      { name: "Nemlendirici Yüz Kremi 50ml", attrs: { hacim: "50ml" } },
      { name: "Maskara Suya Dayanıklı" },
      { name: "Ruj Mat Bitiş" },
      { name: "Güneş Kremi SPF 50 200ml", attrs: { spf: "50", hacim: "200ml" } },
      { name: "Saç Bakım Şampuanı 400ml", attrs: { hacim: "400ml" } },
      { name: "Yüz Temizleme Jeli 150ml", attrs: { hacim: "150ml" } },
    ],
  },
  {
    name: "Oyuncak",
    product_type: "Anne & Bebek > Oyuncak",
    brands: ["Lego", "Barbie", "Hot Wheels", "Pırıl", "Fisher Price", "Nerf"],
    priceMin: 120,
    priceMax: 6500,
    bases: [
      { name: "City İtfaiye Seti 500 Parça" },
      { name: "Dreamhouse Oyun Seti" },
      { name: "10'lu Araba Seti" },
      { name: "Eğitici Aktivite Küpü" },
      { name: "Su Tabancası Mega" },
      { name: "Teknik Yarış Arabası Seti" },
      { name: "Peluş Ayı 60 cm" },
    ],
  },
  {
    name: "Moda Giyim",
    product_type: "Moda > Giyim",
    brands: ["Nike", "Adidas", "Mavi", "Koton", "LC Waikiki", "Puma"],
    priceMin: 250,
    priceMax: 7500,
    bases: [
      { name: "Erkek Spor Ayakkabı", attrs: { renk: "Siyah" } },
      { name: "Kadın Koşu Ayakkabısı", attrs: { renk: "Beyaz" } },
      { name: "Slim Fit Kot Pantolon", attrs: { renk: "Mavi" } },
      { name: "Oversize Sweatshirt", attrs: { renk: "Gri" } },
      { name: "Basic Tişört 3'lü Paket" },
      { name: "Şişme Mont Su Geçirmez", attrs: { renk: "Lacivert" } },
      { name: "Spor Eşofman Takımı" },
    ],
  },
  {
    name: "Küçük Ev Aletleri",
    product_type: "Ev & Yaşam > Küçük Ev Aletleri",
    brands: ["Arzum", "Fakir", "Philips", "Karaca", "Tefal", "Goldmaster"],
    priceMin: 350,
    priceMax: 12000,
    bases: [
      { name: "Robot Süpürge Haritalı" },
      { name: "Espresso Kahve Makinesi" },
      { name: "Airfryer XL 7 Litre" },
      { name: "Saç Kurutma Makinesi 2200W" },
      { name: "Blender Set 1000W" },
      { name: "Ütü Buharlı 2600W" },
      { name: "Su Isıtıcı Cam 1.7 Litre" },
    ],
  },
];

const STORES = [
  "TeknoMarket", "MegaElektronik", "EvAlışveriş", "TrendStore", "FiyatDeposu",
  "DijitalDünya", "EkonomikPazar", "HızlıAlış", "OutletCity", "GurmePazar",
];

function gtin(seed: number): string {
  // 13 haneli sahte ama tutarlı EAN
  const base = (8690000000000 + seed * 7919) % 9000000000000 + 1000000000000;
  return String(base).slice(0, 13);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

type CatalogItem = {
  id: number;
  gtin: string;
  mpn: string;
  title: string;
  brand: string;
  product_type: string;
  basePrice: number;
  attrs: Record<string, string>;
};

function buildCatalog(): CatalogItem[] {
  const items: CatalogItem[] = [];
  let id = 1;
  for (const cat of CATEGORIES) {
    for (const base of cat.bases) {
      for (const brand of cat.brands) {
        const title = `${brand} ${base.name}`;
        const basePrice =
          Math.round(
            (cat.priceMin + Math.random() * (cat.priceMax - cat.priceMin)) / 10
          ) * 10;
        items.push({
          id,
          gtin: gtin(id),
          mpn: `${brand.slice(0, 3).toUpperCase()}-${1000 + id}`,
          title,
          brand,
          product_type: cat.product_type,
          basePrice,
          attrs: base.attrs ?? {},
        });
        id++;
      }
    }
  }
  return items;
}

function itemXml(it: CatalogItem, priceFactor: number): string {
  const price = Math.round(it.basePrice * priceFactor);
  const hasSale = Math.random() < 0.45;
  const oldPrice = hasSale ? Math.round(price * (1 + 0.05 + Math.random() * 0.25)) : null;
  const avail = Math.random() < 0.92 ? "in stock" : "out of stock";
  const attrXml = Object.entries(it.attrs)
    .map(([k, v]) => `    <g:${k === "hafiza" ? "size" : k === "renk" ? "color" : k}>${esc(v)}</g:${k === "hafiza" ? "size" : k === "renk" ? "color" : k}>`)
    .join("\n");
  return `  <item>
    <g:id>${it.gtin}</g:id>
    <title>${esc(it.title)}</title>
    <link>https://example-store.com/p/${it.gtin}</link>
    <g:price>${price} TRY</g:price>
${oldPrice ? `    <g:sale_price>${price} TRY</g:sale_price>` : ""}
    <g:image_link>https://picsum.photos/seed/${it.gtin}/500/500</g:image_link>
    <g:brand>${esc(it.brand)}</g:brand>
    <g:gtin>${it.gtin}</g:gtin>
    <g:mpn>${esc(it.mpn)}</g:mpn>
    <g:product_type>${esc(it.product_type)}</g:product_type>
    <g:availability>${avail}</g:availability>
${attrXml}
  </item>`;
}

async function main() {
  const catalog = buildCatalog();
  const outDir = path.join(process.cwd(), "data", "demo-feeds");
  await fs.mkdir(outDir, { recursive: true });

  for (let s = 0; s < STORES.length; s++) {
    const store = STORES[s];
    // Her mağaza katalogun ~%55'ini taşısın (rastgele alt küme) -> çoklu satıcı.
    const subset = catalog.filter(() => Math.random() < 0.55);
    const items = subset
      .map((it) => itemXml(it, 0.9 + Math.random() * 0.2)) // ±%10 fiyat farkı
      .join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${store} Ürün Feed</title>
  <link>https://example-store.com</link>
  <description>Demo feed — FİYATBUL</description>
${items}
</channel>
</rss>`;
    const slug = store.toLowerCase().replace(/[^a-z0-9]/g, "-");
    await fs.writeFile(path.join(outDir, `${slug}.xml`), xml, "utf-8");
    console.log(`✓ ${slug}.xml — ${subset.length} ürün`);
  }
  console.log(`\nKatalog: ${catalog.length} kanonik ürün, ${STORES.length} mağaza.`);
}

main();
