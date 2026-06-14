"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { registerMerchantAction } from "@/server/actions/merchant-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MerchantRegisterPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await registerMerchantAction({}, new FormData(e.currentTarget));
    setPending(false);
    if (res.ok) {
      router.push("/satici/panel");
      router.refresh();
    } else {
      setError(res.error ?? "Bir hata oluştu.");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-bold">Satıcı kaydı</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Firmanı kaydet, ürünlerini FİYATBUL'da listele. Başvurun admin onayından sonra aktifleşir.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Firma adı</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="websiteUrl">Web sitesi</Label>
          <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="logoUrl">Logo URL (opsiyonel)</Label>
          <Input id="logoUrl" name="logoUrl" type="url" placeholder="https://..." />
        </div>
        {error && <p className="text-sm text-[var(--rise)]">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Gönderiliyor…" : "Başvuruyu gönder"}
        </Button>
      </form>
    </div>
  );
}
