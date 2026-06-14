/**
 * FİYATBUL seed — ilk açılışta DOLU site.
 * 1) Kategori ağacı (materialized path)  2) Markalar  3) Sistem mağazaları + DEMO feed
 * 4) Runner ile demo feed'leri işle  5) 30 günlük sentetik fiyat geçmişi  6) Admin + demo satıcı
 *
 * Çalıştır: npm run seed   (veya prod: DATABASE_URL=<prod> npm run seed)
 */
import "./load-env"; // EN ÜSTTE: runner/prisma import'larından önce env yüklensin
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { runFeed } from "../src/feeds/runner";
import { CATALOG, catalogGtin } from "../data/catalog";

const prisma = new PrismaClient();

/** Eski/önceki seed verisini temizle (idempotent yeniden seed). */
async function cleanup() {
  await prisma.click.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.matchReview.deleteMany();
  await prisma.priceAlert.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.ingestionRun.deleteMany();
  await prisma.feedSource.deleteMany();
}

/** Ingest sonrası: katalogdan gerçek teknik özellikleri + puan/yorumu ürünlere ata (GTIN eşleşmesi). */
async function assignCatalogData() {
  let updated = 0;
  for (let i = 0; i < CATALOG.length; i++) {
    const item = CATALOG[i];
    const gtin = catalogGtin(i);
    const product = await prisma.product.findUnique({ where: { gtin }, select: { id: true } });
    if (!product) continue;
    // gerçekçi puan: 3.8–4.9, yorum: 12–2400
    const rating = Math.round((3.8 + Math.random() * 1.1) * 10) / 10;
    const reviewCount = Math.floor(12 + Math.random() * 2400);
    await prisma.product.update({
      where: { id: product.id },
      data: {
        attributes: item.specs as object,
        rating,
        reviewCount,
        description: `${item.brand} ${item.model} — ${item.categoryName} kategorisinde öne çıkan model. Tüm satıcıların güncel fiyatlarını karşılaştır, en uygununu seç.`,
      },
    });
    updated++;
  }
  console.log(`  ✓ ${updated} ürüne gerçek özellik + puan atandı`);
}

function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u",
  };
  return input.split("").map((ch) => map[ch] ?? ch).join("")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// --- 1) Kategori ağacı ---
type Node = { name: string; children?: Node[] };
const TAXONOMY: Node[] = [
  { name: "Elektronik", children: [
    { name: "Telefon", children: [{ name: "Akıllı Telefon" }] },
    { name: "Bilgisayar", children: [{ name: "Dizüstü" }] },
    { name: "TV & Ses", children: [{ name: "Televizyon" }, { name: "Kulaklık" }] },
    { name: "Giyilebilir", children: [{ name: "Akıllı Saat" }] },
    { name: "Oyun", children: [{ name: "Oyun Konsolu" }] },
  ]},
  { name: "Ev & Yaşam", children: [
    { name: "Beyaz Eşya" },
    { name: "Küçük Ev Aletleri" },
  ]},
  { name: "Kozmetik & Kişisel Bakım", children: [{ name: "Parfüm" }] },
  { name: "Moda", children: [{ name: "Ayakkabı" }] },
];

async function seedCategories(nodes: Node[], parentId: string | null, parentPath: string, order = 0) {
  let i = order;
  for (const node of nodes) {
    const slug = slugify(node.name);
    const nodePath = parentPath ? `${parentPath}/${slug}` : slug;
    await prisma.category.upsert({
      where: { slug },
      update: { name: node.name, path: nodePath, parentId, order: i },
      create: { name: node.name, slug, path: nodePath, parentId, order: i },
    });
    const created = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
    if (node.children?.length && created) {
      await seedCategories(node.children, created.id, nodePath);
    }
    i++;
  }
}

// --- 2) Markalar ---
const BRANDS = [
  "Apple", "Samsung", "Xiaomi", "Oppo", "Realme", "Huawei", "Asus", "Lenovo", "HP",
  "Monster", "Casper", "Arçelik", "Bosch", "Siemens", "Vestel", "LG", "Philips", "TCL",
  "Sony", "Loreal", "Maybelline", "Nivea", "Garnier", "Avon", "Clinique", "Lego", "Barbie",
  "Hot Wheels", "Pırıl", "Fisher Price", "Nerf", "Nike", "Adidas", "Mavi", "Koton",
  "LC Waikiki", "Puma", "Arzum", "Fakir", "Karaca", "Tefal", "Goldmaster",
];

async function seedBrands() {
  for (const name of BRANDS) {
    const slug = slugify(name);
    await prisma.brand.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
}

// --- 3) Sistem mağazaları + DEMO feed ---
async function seedSystemMerchants() {
  const dir = path.join(process.cwd(), "data", "demo-feeds");
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".xml"));
  const merchants: { id: string; feedId: string; name: string }[] = [];

  for (const file of files) {
    // dosya adından okunabilir mağaza adı türet
    const raw = file.replace(/\.xml$/, "");
    const name = raw.split("-").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || raw;
    const slug = slugify(name) || raw;

    const merchant = await prisma.merchant.upsert({
      where: { slug },
      update: { isSystem: true, status: "APPROVED" },
      create: {
        name,
        slug,
        isSystem: true,
        status: "APPROVED",
        tier: "FREE",
        commissionRate: new Prisma.Decimal((3 + Math.random() * 7).toFixed(2)),
        logoUrl: `https://picsum.photos/seed/${slug}-logo/120/120`,
        websiteUrl: `https://${slug}.example.com`,
      },
    });

    const feed = await prisma.feedSource.findFirst({ where: { merchantId: merchant.id, type: "DEMO" } });
    let feedId: string;
    if (feed) {
      feedId = feed.id;
      await prisma.feedSource.update({ where: { id: feed.id }, data: { url: `data/demo-feeds/${file}` } });
    } else {
      const created = await prisma.feedSource.create({
        data: {
          merchantId: merchant.id,
          name: `${name} Demo Feed`,
          type: "DEMO",
          url: `data/demo-feeds/${file}`,
          mappingConfig: {}, // DEMO adapter Google Shopping preset'ini kullanır
          enabled: true,
        },
      });
      feedId = created.id;
    }
    merchants.push({ id: merchant.id, feedId, name });
  }
  return merchants;
}

// --- 4) Runner ile feed'leri işle (bounded → bitene kadar döngü) ---
async function ingestAll(feedIds: string[]) {
  for (const feedId of feedIds) {
    let guard = 0;
    while (guard < 50) {
      const source = await prisma.feedSource.findUnique({ where: { id: feedId } });
      if (!source) break;
      const result = await runFeed(source);
      const refreshed = await prisma.feedSource.findUnique({ where: { id: feedId }, select: { lastStatus: true } });
      if (refreshed?.lastStatus !== "RUNNING") break; // tamamlandı
      if (result.processed === 0) break;
      guard++;
    }
    const f = await prisma.feedSource.findUnique({ where: { id: feedId }, select: { name: true, itemCount: true, lastStatus: true } });
    console.log(`  ✓ ${f?.name}: ${f?.itemCount} ürün (${f?.lastStatus})`);
  }
}

// --- 5) 30 günlük sentetik fiyat geçmişi ---
async function backfillHistory() {
  const products = await prisma.product.findMany({
    where: { offerCount: { gt: 0 }, lowestPrice: { not: null } },
    select: { id: true, lowestPrice: true },
  });
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  for (const p of products) {
    const current = Number(p.lowestPrice);
    // mevcut geçmişi temizleyip 30 gün üret (tutarlı grafik)
    await prisma.priceHistory.deleteMany({ where: { productId: p.id } });
    const rows: Prisma.PriceHistoryCreateManyInput[] = [];
    // başlangıç fiyatı bugünden %5-25 daha yüksek, kademeli düşüş + gürültü
    const startFactor = 1.05 + Math.random() * 0.2;
    for (let d = 30; d >= 0; d--) {
      const t = (30 - d) / 30; // 0..1
      const trend = startFactor + (1 - startFactor) * t;
      const noise = 1 + (Math.random() - 0.5) * 0.04;
      const price = Math.max(1, Math.round(current * trend * noise));
      rows.push({
        productId: p.id,
        price: new Prisma.Decimal(price),
        recordedAt: new Date(now - d * day),
      });
    }
    // son noktayı kesin güncel fiyata sabitle
    rows[rows.length - 1].price = new Prisma.Decimal(current);
    await prisma.priceHistory.createMany({ data: rows });
  }
  console.log(`  ✓ ${products.length} ürün için 30 günlük fiyat geçmişi üretildi`);
}

// --- 6) Admin + demo satıcı kullanıcı ---
async function seedUsers() {
  const adminPass = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@fiyatbul.com" },
    update: { role: "ADMIN", passwordHash: adminPass },
    create: { email: "admin@fiyatbul.com", name: "Admin", role: "ADMIN", passwordHash: adminPass },
  });

  const merchPass = await bcrypt.hash("satici1234", 10);
  const merchUser = await prisma.user.upsert({
    where: { email: "satici@fiyatbul.com" },
    update: { role: "MERCHANT", passwordHash: merchPass },
    create: { email: "satici@fiyatbul.com", name: "Demo Satıcı", role: "MERCHANT", passwordHash: merchPass },
  });

  // demo satıcıya bağlı bir mağaza (self-service örneği)
  const slug = "demo-magaza";
  const existing = await prisma.merchant.findUnique({ where: { slug } });
  if (!existing) {
    await prisma.merchant.create({
      data: {
        userId: merchUser.id,
        name: "Demo Mağaza",
        slug,
        status: "APPROVED",
        tier: "PRO",
        websiteUrl: "https://demo-magaza.example.com",
      },
    });
  }
}

async function main() {
  console.log("🌱 FİYATBUL seed başlıyor…");
  console.log("• Eski veriyi temizleme");
  await cleanup();
  console.log("• Kategoriler");
  await seedCategories(TAXONOMY, null, "");
  console.log("• Markalar"); await seedBrands();
  console.log("• Sistem mağazaları + demo feed");
  const merchants = await seedSystemMerchants();
  console.log(`• Feed ingestion (${merchants.length} feed) — bu birkaç dakika sürebilir…`);
  await ingestAll(merchants.map((m) => m.feedId));
  console.log("• Gerçek özellik + puan atama"); await assignCatalogData();
  console.log("• Fiyat geçmişi"); await backfillHistory();
  console.log("• Kullanıcılar"); await seedUsers();

  const counts = {
    products: await prisma.product.count(),
    offers: await prisma.offer.count(),
    merchants: await prisma.merchant.count(),
    history: await prisma.priceHistory.count(),
  };
  console.log("\n✅ Seed tamamlandı:", counts);
  console.log("\n👤 Giriş bilgileri:");
  console.log("   Admin:  admin@fiyatbul.com / admin1234");
  console.log("   Satıcı: satici@fiyatbul.com / satici1234");
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
