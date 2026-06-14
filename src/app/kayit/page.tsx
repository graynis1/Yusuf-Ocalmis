"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction, type ActionState } from "@/server/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [state, setState] = React.useState<ActionState>({});
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await registerAction({}, fd);
    setPending(false);
    if (res.ok) {
      router.push("/hesap");
      router.refresh();
    } else {
      setState(res);
    }
  }

  return (
    <div className="container flex justify-center py-16">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-card p-6">
        <h1 className="font-display text-2xl font-bold">Kayıt ol</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Ücretsiz hesap aç, fırsatları kaçırma.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Ad soyad</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
          </div>
          {state.error && <p className="text-sm text-[var(--rise)]">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Hesap oluşturuluyor…" : "Kayıt ol"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          Zaten üye misin?{" "}
          <Link href="/giris" className="font-medium text-[var(--brand)]">Giriş yap</Link>
        </p>
      </div>
    </div>
  );
}
