# FİYATBUL — Fiyat Karşılaştırma Platformu

Vercel-native, Next.js 14 + Prisma + PostgreSQL tabanlı, ilk deploy'da **seed verisiyle dolu** gelen
tam bir fiyat karşılaştırma platformu. Tüketici sitesi + satıcı paneli + admin panel + iki kaynaklı
veri boru hattı (proaktif feed toplama + satıcı self-service).

## Özellikler
- Kanonik ürün + çoklu satıcı teklifi modeli, **ürün eşleştirme motoru** (GTIN → marka+MPN → fuzzy).
- Postgres `tsvector` + `pg_trgm` ile arama, facet filtreleme, type-as-you-search öneriler.
- Fiyat geçmişi grafiği, fiyat-delta dili, fiyat alarmı, favoriler.
- Feed adapter'ları: XML, CSV, JSON, Google Shopping, DEMO (repoya gömülü → ilk açılışta dolu).
- Vercel Cron ile bounded-batch + idempotent + resumable ingestion.
- Gelir: affiliate clickout takibi, satıcı abonelik tier'ları, sponsorlu yerleşim.

## Teknoloji
Next.js 14 (App Router) · TypeScript (strict) · Tailwind + shadcn/ui · Prisma · Auth.js v5 ·
Zod · Recharts · Vitest.

## Yerel geliştirme
```bash
npm install
cp .env.example .env            # değerleri doldur (DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, CRON_SECRET…)
npx prisma migrate deploy       # şema + arama indeksleri (pg_trgm, tsvector)
npm run seed                    # katalog + demo veriyi yükle
npm run dev
```
Demo feed XML'leri yeniden üretmek için: `npx tsx scripts/generate-demo-feeds.ts`

## Testler
```bash
npm run test                    # matching engine + normalize birim testleri (Vitest)
```

## Vercel'e deploy
1. Bu repoyu GitHub'a push et, Vercel'e import et.
2. Vercel → **Storage → Postgres (Neon)** ekle. `DATABASE_URL` (pooled) ve `DIRECT_URL` (direct)
   otomatik gelir; gelmezse Environment Variables'a ekle.
3. Diğer env'leri gir: `NEXTAUTH_SECRET` (veya `AUTH_SECRET`), `NEXTAUTH_URL`, `CRON_SECRET`,
   `NEXT_PUBLIC_SITE_URL`. Opsiyonel: `GOOGLE_CLIENT_ID/SECRET`, `UPSTASH_*`, `STRIPE_ENABLED`.
4. Build Command zaten `prisma generate && prisma migrate deploy && next build` (package.json).
5. **Seed (bir kez):** yerelden prod DB'ye karşı çalıştır:
   ```bash
   DATABASE_URL="<prod-pooled>" DIRECT_URL="<prod-direct>" npm run seed
   ```
6. Aç → site dolu ve çalışır. Cron'lar (`vercel.json`) otomatik tetiklenir:
   - `/api/cron/ingest` saat başı (feed toplama)
   - `/api/cron/snapshot` her gün 03:00 (fiyat snapshot + alarm kontrolü + cache)

## Giriş bilgileri (seed sonrası)
| Rol | E-posta | Şifre |
|---|---|---|
| Admin | `admin@fiyatbul.com` | `admin1234` |
| Satıcı | `satici@fiyatbul.com` | `satici1234` |

> Prod'da bu şifreleri mutlaka değiştir.

## Gerçek affiliate feed'leri
Trendyol / Hepsiburada / n11 / Amazon TR / Google Shopping için hazır `mappingConfig` preset'leri
`src/feeds/presets.ts` içinde gelir. Satıcı panelinden (`/satici/feeds`) ya da admin'den feed URL'i
girilene kadar **pasif**tir; o ana dek site demo feed'lerle doludur. Scraping yapılmaz.

## Mimari notlar
- Para alanları `Decimal`, asla float. Türkçe `toLocaleLowerCase('tr')`. KVKK: IP'ler `ipHash`'lenir.
- Arama mantığı `src/server/search/` arkasında soyut — ileride Meilisearch'e tek dosyada geçilebilir.
- Feed katmanı `src/feeds/` adapter pattern — ölçekte harici worker'a (Railway/Render) taşınabilir.
- Ingestion bounded-batch (≤200/çağrı), cursor `IngestionRun`'da → serverless süre sınırına uygun.

## Klasör yapısı
```
src/
  app/            # App Router sayfaları + API route'ları
  components/     # UI + ürün + dashboard + admin bileşenleri
  feeds/          # adapter pattern, mapper, runner, presets
  server/         # matching, search, products, analytics, auth, actions
  lib/            # utils, prisma, fonts, hash
prisma/           # schema, migration, seed
data/demo-feeds/  # repoya gömülü demo XML feed'leri
scripts/          # demo feed üretici
```
