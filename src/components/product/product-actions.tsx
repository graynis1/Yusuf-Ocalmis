"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

export function ProductActions({
  productId,
  lowestPrice,
  isLoggedIn,
  initialFavorite,
  initialAlertPrice,
}: {
  productId: string;
  lowestPrice: number | null;
  isLoggedIn: boolean;
  initialFavorite: boolean;
  initialAlertPrice: number | null;
}) {
  const router = useRouter();
  const [fav, setFav] = React.useState(initialFavorite);
  const [busy, setBusy] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [target, setTarget] = React.useState(
    initialAlertPrice?.toString() ?? (lowestPrice ? Math.floor(lowestPrice * 0.9).toString() : "")
  );
  const [alertSet, setAlertSet] = React.useState(initialAlertPrice != null);
  const [msg, setMsg] = React.useState<string | null>(null);

  function requireLogin() {
    router.push("/giris?next=" + encodeURIComponent(window.location.pathname));
  }

  async function toggleFav() {
    if (!isLoggedIn) return requireLogin();
    setBusy(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFav(data.favorited);
      }
    } finally {
      setBusy(false);
    }
  }

  async function saveAlert() {
    if (!isLoggedIn) return requireLogin();
    const price = Number(target);
    if (!price || price <= 0) {
      setMsg("Geçerli bir hedef fiyat gir.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, targetPrice: price }),
      });
      if (res.ok) {
        setAlertSet(true);
        setAlertOpen(false);
        setMsg(`Fiyat ${formatPrice(price)} altına düşünce haber vereceğiz.`);
      } else {
        setMsg("Alarm kurulamadı, tekrar dene.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button onClick={() => setAlertOpen((v) => !v)} variant={alertSet ? "save" : "default"} className="flex-1">
          {alertSet ? <BellRing className="size-4" /> : <Bell className="size-4" />}
          {alertSet ? "Alarm kurulu" : "Fiyat alarmı kur"}
        </Button>
        <Button onClick={toggleFav} disabled={busy} variant="outline" aria-label="Favorilere ekle">
          <Heart className={`size-4 ${fav ? "fill-[var(--rise)] text-[var(--rise)]" : ""}`} />
        </Button>
      </div>

      {alertOpen && (
        <div className="animate-fade-up rounded-lg border border-[var(--border)] bg-card p-4">
          <label className="mb-2 block text-sm font-medium">Hedef fiyat (₺)</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Örn. 45000"
            />
            <Button onClick={saveAlert} disabled={busy}>Kur</Button>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Fiyat bu değerin altına düştüğünde e-posta ile haber veririz.
          </p>
        </div>
      )}

      {msg && <p className="text-sm text-[var(--save)]">{msg}</p>}
    </div>
  );
}
