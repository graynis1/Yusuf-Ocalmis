"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction, type ActionState } from "@/server/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/hesap";
  const [state, setState] = React.useState<ActionState>({});
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await loginAction({}, fd);
    setPending(false);
    if (res.ok) {
      router.push(next);
      router.refresh();
    } else {
      setState(res);
    }
  }

  return (
    <div className="container flex justify-center py-16">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-card p-6">
        <h1 className="font-display text-2xl font-bold">Giriş yap</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Favorilerine ve fiyat alarmlarına eriş.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {state.error && <p className="text-sm text-[var(--rise)]">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Giriş yapılıyor…" : "Giriş yap"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="font-medium text-[var(--brand)]">Kayıt ol</Link>
        </p>
      </div>
    </div>
  );
}
