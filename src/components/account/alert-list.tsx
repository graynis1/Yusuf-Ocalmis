"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type AlertItem = {
  productSlug: string;
  productTitle: string;
  targetPrice: number;
  currentPrice: number | null;
};

export function AlertList({ alerts }: { alerts: AlertItem[] }) {
  const router = useRouter();
  const [removing, setRemoving] = React.useState<string | null>(null);

  async function remove(slug: string, productSlug: string) {
    setRemoving(slug);
    // productId yerine slug ile API çalışmaz; bu yüzden ürün sayfasından silinir.
    // Burada hızlı silme için productId gerekir; alarmı pasifleştirmek adına API'ye slug->id çözümü yok.
    // Basit yaklaşım: kullanıcıyı ürün sayfasına yönlendirmek yerine doğrudan DELETE çağrısı.
    await fetch("/api/alerts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug }),
    });
    router.refresh();
  }

  return (
    <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)]">
      {alerts.map((a) => {
        const reached = a.currentPrice != null && a.currentPrice <= a.targetPrice;
        return (
          <li key={a.productSlug} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <Link href={`/urun/${a.productSlug}`} className="line-clamp-1 font-medium text-ink hover:text-[var(--brand)]">
                {a.productTitle}
              </Link>
              <div className="mt-1 flex items-center gap-3 text-sm text-[var(--muted)]">
                <span>Hedef: <span className="tabular font-semibold text-ink">{formatPrice(a.targetPrice)}</span></span>
                {a.currentPrice != null && (
                  <span>Şu an: <span className="tabular">{formatPrice(a.currentPrice)}</span></span>
                )}
                {reached && <Badge variant="save">Hedefe ulaşıldı</Badge>}
              </div>
            </div>
            <button
              onClick={() => remove(a.productSlug, a.productSlug)}
              disabled={removing === a.productSlug}
              className="text-[var(--muted)] hover:text-[var(--rise)]"
              aria-label="Alarmı sil"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
