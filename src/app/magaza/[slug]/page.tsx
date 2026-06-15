import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Globe, Mail, Phone, Tag, Package } from "lucide-react";
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

  const meta: { icon: React.ReactNode; text: string; href?: string }[] = [];
  if (merchant.sector) meta.push({ icon: <Tag className="size-4" />, text: merchant.sector });
  if (merchant.city) meta.push({ icon: <MapPin className="size-4" />, text: merchant.city });
  if (merchant.websiteUrl)
    meta.push({ icon: <Globe className="size-4" />, text: "Web sitesi", href: merchant.websiteUrl });
  if (merchant.email)
    meta.push({ icon: <Mail className="size-4" />, text: merchant.email, href: `mailto:${merchant.email}` });
  if (merchant.phone)
    meta.push({ icon: <Phone className="size-4" />, text: merchant.phone, href: `tel:${merchant.phone}` });

  return (
    <div className="container py-8">
      <div className="mb-6 rounded-lg border border-[var(--border)] bg-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-white">
            {merchant.logoUrl ? (
              <Image src={merchant.logoUrl} alt={merchant.name} fill className="object-contain p-2" />
            ) : (
              <div className="grid size-full place-items-center text-[var(--muted)]">
                <Package className="size-7" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{merchant.name}</h1>
              {merchant.status === "APPROVED" && (
                <span className="rounded-full bg-[var(--save)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--save)]">
                  Onaylı satıcı
                </span>
              )}
            </div>
            {merchant.description && (
              <p className="mt-1.5 max-w-2xl text-sm text-[var(--muted)]">{merchant.description}</p>
            )}
            {meta.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
                {meta.map((m, i) =>
                  m.href ? (
                    <a
                      key={i}
                      href={m.href}
                      rel="nofollow"
                      className="flex items-center gap-1.5 hover:text-[var(--brand)]"
                    >
                      <span className="text-[var(--brand)]">{m.icon}</span>
                      {m.text}
                    </a>
                  ) : (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="text-[var(--brand)]">{m.icon}</span>
                      {m.text}
                    </span>
                  )
                )}
                <span className="flex items-center gap-1.5">
                  <Package className="size-4 text-[var(--brand)]" />
                  {products.length} ürün
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <p className="py-12 text-center text-sm text-[var(--muted)]">
          Bu mağazanın henüz listelenen ürünü yok.
        </p>
      )}
    </div>
  );
}
