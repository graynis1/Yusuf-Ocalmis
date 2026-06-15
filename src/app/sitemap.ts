import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yusufocalmis.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/ara",
    "/hakkimizda",
    "/iletisim",
    "/gizlilik",
    "/kvkk",
    "/satici/kayit",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.6,
  }));

  try {
    const [products, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where: { offerCount: { gt: 0 } },
        select: { slug: true, updatedAt: true },
        orderBy: { offerCount: "desc" },
        take: 5000,
      }),
      prisma.category.findMany({ select: { slug: true } }),
      prisma.brand.findMany({ select: { slug: true }, take: 2000 }),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${base}/urun/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${base}/kategori/${c.slug}`,
      changeFrequency: "daily",
      priority: 0.7,
    }));
    const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
      url: `${base}/marka/${b.slug}`,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes];
  } catch {
    return staticRoutes;
  }
}
