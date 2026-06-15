"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { updateMerchantProfileAction } from "@/server/actions/merchant-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SECTORS = [
  "Elektronik",
  "Bilgisayar & Donanım",
  "Telefon & Aksesuar",
  "Beyaz Eşya",
  "Küçük Ev Aletleri",
  "Moda & Giyim",
  "Ayakkabı & Çanta",
  "Kozmetik & Kişisel Bakım",
  "Anne & Bebek",
  "Ev & Yaşam",
  "Spor & Outdoor",
  "Market & Gıda",
  "Diğer",
];

export type MerchantProfileInitial = {
  name: string;
  sector: string;
  description: string;
  contactName: string;
  email: string;
  phone: string;
  taxId: string;
  city: string;
  address: string;
  websiteUrl: string;
  logoUrl: string;
};

export function MerchantProfileForm({ initial }: { initial: MerchantProfileInitial }) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const res = await updateMerchantProfileAction({}, new FormData(e.currentTarget));
    setPending(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setError(res.error ?? "Bir hata oluştu.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Section title="Firma bilgileri">
        <Field label="Firma / mağaza adı" htmlFor="name" required>
          <Input id="name" name="name" required defaultValue={initial.name} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sektör" htmlFor="sector">
            <select
              id="sector"
              name="sector"
              defaultValue={initial.sector}
              className="h-10 w-full rounded-md border border-[var(--border-strong)] bg-white px-3 text-sm text-ink focus-visible:border-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30"
            >
              <option value="">Seçiniz</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vergi / TC kimlik no" htmlFor="taxId">
            <Input id="taxId" name="taxId" inputMode="numeric" defaultValue={initial.taxId} />
          </Field>
        </div>
        <Field label="Kısa tanıtım" htmlFor="description">
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={1000}
            defaultValue={initial.description}
            className="w-full rounded-md border border-[var(--border-strong)] bg-white px-3 py-2 text-sm text-ink placeholder:text-[var(--muted)] focus-visible:border-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30"
          />
        </Field>
      </Section>

      <Section title="İletişim">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Yetkili kişi" htmlFor="contactName">
            <Input id="contactName" name="contactName" defaultValue={initial.contactName} />
          </Field>
          <Field label="Telefon" htmlFor="phone">
            <Input id="phone" name="phone" type="tel" defaultValue={initial.phone} />
          </Field>
          <Field label="E-posta" htmlFor="email">
            <Input id="email" name="email" type="email" defaultValue={initial.email} />
          </Field>
          <Field label="Şehir" htmlFor="city">
            <Input id="city" name="city" defaultValue={initial.city} />
          </Field>
        </div>
        <Field label="Adres" htmlFor="address">
          <Input id="address" name="address" defaultValue={initial.address} />
        </Field>
      </Section>

      <Section title="Online mağaza">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Web sitesi" htmlFor="websiteUrl">
            <Input id="websiteUrl" name="websiteUrl" type="url" defaultValue={initial.websiteUrl} placeholder="https://..." />
          </Field>
          <Field label="Logo URL" htmlFor="logoUrl">
            <Input id="logoUrl" name="logoUrl" type="url" defaultValue={initial.logoUrl} placeholder="https://.../logo.png" />
          </Field>
        </div>
      </Section>

      {error && (
        <p className="rounded-md border border-[var(--rise)]/30 bg-[var(--rise)]/10 px-3 py-2 text-sm text-[var(--rise)]">
          {error}
        </p>
      )}
      {saved && (
        <p className="flex items-center gap-2 rounded-md border border-[var(--save)]/30 bg-[var(--save)]/10 px-3 py-2 text-sm text-[var(--save)]">
          <CheckCircle2 className="size-4" /> Profil güncellendi.
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-card p-5">
      <h2 className="mb-4 font-display text-base font-bold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label} {required && <span className="text-[var(--rise)]">*</span>}
      </Label>
      {children}
    </div>
  );
}
