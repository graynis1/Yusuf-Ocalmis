"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { changeTierAction } from "@/server/actions/merchant-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TIERS = [
  { key: "FREE", name: "Ücretsiz", price: "0₺", features: ["50 listing", "Temel analitik", "Standart sıralama"] },
  { key: "PRO", name: "Pro", price: "499₺/ay", features: ["1.000 listing", "Gelişmiş analitik", "Öne çıkarma hakkı"] },
  { key: "PREMIUM", name: "Premium", price: "1.499₺/ay", features: ["Sınırsız listing", "Tüm analitikler", "Öncelikli öne çıkarma", "Sponsorlu slotlar"] },
] as const;

export function TierSelector({ currentTier }: { currentTier: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function choose(tier: "FREE" | "PRO" | "PREMIUM") {
    setBusy(tier);
    const res = await changeTierAction(tier);
    setBusy(null);
    if (res.ok) {
      setMsg(res.pending
        ? "Talebin alındı. Banka havalesi sonrası admin onayıyla aktifleşecek."
        : "Ücretsiz plana geçtin.");
      router.refresh();
    }
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((t) => {
          const active = currentTier === t.key;
          return (
            <div
              key={t.key}
              className={`rounded-lg border bg-card p-6 ${active ? "border-[var(--brand)] ring-1 ring-[var(--brand)]" : "border-[var(--border)]"}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">{t.name}</h3>
                {active && <Badge variant="brand">Mevcut</Badge>}
              </div>
              <div className="tabular mt-2 font-display text-2xl font-extrabold">{t.price}</div>
              <ul className="mt-4 space-y-2">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <Check className="size-4 text-[var(--save)]" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5 w-full"
                variant={active ? "outline" : "default"}
                disabled={active || busy === t.key}
                onClick={() => choose(t.key)}
              >
                {active ? "Aktif plan" : busy === t.key ? "İşleniyor…" : "Bu planı seç"}
              </Button>
            </div>
          );
        })}
      </div>
      {msg && <p className="mt-4 text-sm text-[var(--save)]">{msg}</p>}
      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
        <strong className="text-ink">Ödeme:</strong> Varsayılan ödeme yöntemi banka havalesidir. Plan seçimin admin onayı
        sonrası aktifleşir. Stripe entegrasyonu ortam değişkeniyle açılabilir.
      </div>
    </div>
  );
}
