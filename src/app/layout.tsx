import type { Metadata } from "next";
import { fontBody, fontDisplay, fontMono } from "@/lib/fonts";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CompareBar } from "@/components/product/compare-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FİYATBUL — Akıllı fiyat karşılaştırma",
    template: "%s · FİYATBUL",
  },
  description:
    "Yüzlerce mağazanın fiyatını tek yerde karşılaştır, fiyat geçmişini gör, en iyi fırsatı yakala.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <CompareBar />
      </body>
    </html>
  );
}
