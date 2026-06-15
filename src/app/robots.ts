import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yusufocalmis.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/satici", "/hesap", "/api", "/out"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
