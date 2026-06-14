import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center py-24 text-center">
      <h1 className="font-display text-5xl font-extrabold">404</h1>
      <p className="mt-3 max-w-sm text-[var(--muted)]">
        Aradığın sayfa bulunamadı. Belki ürün kaldırıldı ya da bağlantı hatalı.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Ana sayfaya dön</Link>
      </Button>
    </div>
  );
}
