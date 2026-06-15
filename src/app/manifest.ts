import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FİYATBUL — Akıllı fiyat karşılaştırma",
    short_name: "FİYATBUL",
    description:
      "Yüzlerce mağazanın fiyatını karşılaştır, fiyat geçmişini gör, en iyi fırsatı yakala.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f4671f",
    lang: "tr",
    categories: ["shopping"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
