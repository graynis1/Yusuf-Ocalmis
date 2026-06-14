import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/product-grid";
import type { ProductCardData } from "@/components/product/product-card";

export const dynamic = "force-dynamic";

export default async function StorePage({ params }: { params: { slug: string } }) {
  const merchant = await prisma.merchant
    .findUnique({ where: { slug: params.slug } })
    .catch(() => null);
  if (!merchant) notFound();

  const offers = await prisma.offer.findMany({
    where: { merchantId: merchant.id, productId: { not: null } },
    orderBy: { price: "asc" },
    take: 48,
    select: {
      price: true,
      oldPrice: true,
      product: {
        select: {
          slug: true,
          title: true,
          imageUrl: true,
          lowestPrice: true,
          offerCount: true,
          brand: { select: { name: true } },
        },
      },
    },
  });

  const seen = new Set<string>();
  const products: ProductCardData[] = [];
  for (const o of offers) {
    if (!o.product || seen.has(o.product.slug)) continue;
    seen.add(o.product.slug);
    products.push({
      slug: o.product.slug,
      title: o.product.title,
      imageUrl: o.product.imageUrl,
      brandName: o.product.brand?.name ?? null,
      lowestPrice: o.product.lowestPrice ? Number(o.product.lowestPrice) : null,
      offerCount: o.product.offerCount,
    });
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-4">
        {merchant.logoUrl && (
          <div className="relative size-16 overflow-hidden rounded-lg border border-[var(--border)] bg-white">
            <Image src={merchant.logoUrl} alt={merchant.name} fill className="object-contain p-2" />
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold">{merchant.name}</h1>
          {merchant.websiteUrl && (
            <a href={merchant.websiteUrl} className="text-sm text-[var(--brand)]" rel="nofollow">
              {merchant.websiteUrl}
            </a>
          )}
        </div>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
