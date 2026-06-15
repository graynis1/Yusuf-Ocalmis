import Link from "next/link";
import type { Metadata } from "next";
import { GitCompare } from "lucide-react";
import { getProductsForCompare } from "@/server/products";
import { ProductImage } from "@/components/product/product-image";
import { RatingStars } from "@/components/product/rating-stars";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ürün karşılaştırma",
  description: "Seçtiğin ürünleri fiyat, puan ve özellik bazında yan yana karşılaştır.",
};

export const dynamic = "force-dynamic";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { slugs?: string };
}) {
  const slugs = (searchParams.slugs ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const products = await getProductsForCompare(slugs).catch(() => []);

  if (products.length < 2) {
    return (
      <div className="container py-16 text-center">
        <GitCompare className="mx-auto size-10 text-[var(--muted)]" />
        <h1 className="mt-4 font-display text-2xl font-bold">Karşılaştırma boş</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
          Karşılaştırmak için ürün sayfalarındaki <strong>Karşılaştır</strong> butonuyla
          en az 2 ürün ekle. Seçtiklerin sayfa altındaki çubukta birikir.
        </p>
        <Link
          href="/ara"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-[var(--brand)] px-6 font-semibold text-white hover:brightness-95"
        >
          Ürünlere göz at
        </Link>
      </div>
    );
  }

  // En ucuzu vurgula
  const prices = products.map((p) => p.lowestPrice).filter((v): v is number => v != null);
  const minPrice = prices.length ? Math.min(...prices) : null;

  // Tüm özellik anahtarlarının birleşimi (giriş sırasını koruyarak)
  const attrKeys: string[] = [];
  for (const p of products) {
    for (const k of Object.keys(p.attributes)) {
      if (!attrKeys.includes(k)) attrKeys.push(k);
    }
  }

  const cols = `minmax(120px,160px) repeat(${products.length}, minmax(160px,1fr))`;

  return (
    <div className="container py-8">
      <h1 className="mb-1 flex items-center gap-2 font-display text-2xl font-bold">
        <GitCompare className="size-6 text-[var(--brand)]" /> Ürün karşılaştırma
      </h1>
      <p className="mb-6 text-sm text-[var(--muted)]">{products.length} ürün karşılaştırılıyor.</p>

      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <div className="min-w-full">
          {/* Başlık: ürün kartları */}
          <div className="grid border-b border-[var(--border)] bg-card" style={{ gridTemplateColumns: cols }}>
            <div className="p-4" />
            {products.map((p) => (
              <div key={p.slug} className="border-l border-[var(--border)] p-4">
                <Link href={`/urun/${p.slug}`} className="block">
                  <div className="relative mx-auto aspect-square w-full max-w-[140px] overflow-hidden rounded-md border border-[var(--border)] bg-white">
                    <ProductImage
                      src={p.imageUrl}
                      alt={p.title}
                      brand={p.brandName}
                      categorySlug={p.categorySlug}
                      sizes="140px"
                    />
                  </div>
                  <h2 className="mt-3 line-clamp-2 text-sm font-semibold text-ink hover:text-[var(--brand)]">
                    {p.title}
                  </h2>
                </Link>
              </div>
            ))}
          </div>

          <CompareRow label="En düşük fiyat" cols={cols}>
            {products.map((p) => (
              <Cell key={p.slug}>
                <span
                  className={`tabular text-lg font-extrabold ${
                    minPrice != null && p.lowestPrice === minPrice ? "text-[var(--save)]" : "text-ink"
                  }`}
                >
                  {formatPrice(p.lowestPrice)}
                </span>
                {minPrice != null && p.lowestPrice === minPrice && (
                  <span className="ml-1 align-middle text-[11px] font-semibold text-[var(--save)]">
                    en ucuz
                  </span>
                )}
              </Cell>
            ))}
          </CompareRow>

          <CompareRow label="Puan" cols={cols} alt>
            {products.map((p) => (
              <Cell key={p.slug}>
                {p.rating ? (
                  <RatingStars rating={p.rating} reviewCount={p.reviewCount} />
                ) : (
                  <span className="text-sm text-[var(--muted)]">—</span>
                )}
              </Cell>
            ))}
          </CompareRow>

          <CompareRow label="Satıcı sayısı" cols={cols}>
            {products.map((p) => (
              <Cell key={p.slug}>
                <span className="text-sm text-ink">{p.offerCount} satıcı</span>
              </Cell>
            ))}
          </CompareRow>

          <CompareRow label="Marka" cols={cols} alt>
            {products.map((p) => (
              <Cell key={p.slug}>
                <span className="text-sm text-ink">{p.brandName ?? "—"}</span>
              </Cell>
            ))}
          </CompareRow>

          <CompareRow label="Kategori" cols={cols}>
            {products.map((p) => (
              <Cell key={p.slug}>
                <span className="text-sm text-ink">{p.categoryName ?? "—"}</span>
              </Cell>
            ))}
          </CompareRow>

          {attrKeys.map((k, i) => (
            <CompareRow key={k} label={k} cols={cols} alt={i % 2 === 0} capitalize>
              {products.map((p) => (
                <Cell key={p.slug}>
                  <span className="text-sm text-ink">{p.attributes[k] ?? "—"}</span>
                </Cell>
              ))}
            </CompareRow>
          ))}

          {/* Aksiyon satırı */}
          <div className="grid border-t border-[var(--border)]" style={{ gridTemplateColumns: cols }}>
            <div className="p-4" />
            {products.map((p) => (
              <div key={p.slug} className="border-l border-[var(--border)] p-4">
                <Link
                  href={`/urun/${p.slug}`}
                  className="flex h-10 items-center justify-center rounded-md bg-[var(--brand)] text-sm font-semibold text-white hover:brightness-95"
                >
                  İncele
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  cols,
  alt,
  capitalize,
  children,
}: {
  label: string;
  cols: string;
  alt?: boolean;
  capitalize?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid border-b border-[var(--border)] ${alt ? "bg-[var(--surface)]" : "bg-card"}`}
      style={{ gridTemplateColumns: cols }}
    >
      <div
        className={`flex items-center p-4 text-xs font-semibold text-[var(--muted)] ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center border-l border-[var(--border)] p-4">{children}</div>;
}
