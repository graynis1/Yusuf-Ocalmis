import { ProductCard, type ProductCardData } from "./product-card";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center text-[var(--muted)]">
        Bu aramaya uygun ürün bulunamadı. Kategorilere göz at →
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.slug} p={p} />
      ))}
    </div>
  );
}
