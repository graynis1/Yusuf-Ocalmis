"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Store, Phone, Globe, CheckCircle2 } from "lucide-react";
import { registerMerchantAction } from "@/server/actions/merchant-actions";
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

const BENEFITS = [
  "Yüzlerce alıcının önüne tek tıkla çık",
  "Feed bağla, ürünlerin otomatik güncellensin",
  "Fiyat geçmişi ve tıklama analitiği",
  "Sponsorlu listeleme ile öne çık",
];

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
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-[var(--brand)]/10 text-[var(--brand)]">
            <Store className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">Satıcı başvurusu</h1>
            <p className="text-sm text-[var(--muted)]">
              Firma bilgilerini doldur; başvurun admin onayından sonra aktifleşir.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-8">
          {/* Firma bilgileri */}
          <Section title="Firma bilgileri" desc="Mağazan müşterilere bu bilgilerle görünecek.">
            <Field label="Firma / mağaza adı" htmlFor="name" required>
              <Input id="name" name="name" required placeholder="Örn. TeknoMarket" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Sektör" htmlFor="sector">
                <select
                  id="sector"
                  name="sector"
                  defaultValue=""
                  className="h-10 w-full rounded-md border border-[var(--border-strong)] bg-white px-3 text-sm text-ink focus-visible:border-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30"
                >
                  <option value="" disabled>
                    Seçiniz
                  </option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Vergi / TC kimlik no" htmlFor="taxId">
                <Input id="taxId" name="taxId" inputMode="numeric" placeholder="Opsiyonel" />
              </Field>
            </div>
            <Field label="Kısa tanıtım" htmlFor="description">
              <textarea
                id="description"
                name="description"
                rows={3}
                maxLength={1000}
                placeholder="Mağazanı, ürün gruplarını ve avantajlarını birkaç cümleyle anlat."
                className="w-full rounded-md border border-[var(--border-strong)] bg-white px-3 py-2 text-sm text-ink placeholder:text-[var(--muted)] focus-visible:border-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30"
              />
            </Field>
          </Section>

          {/* İletişim */}
          <Section title="İletişim" desc="Onay süreci ve bildirimler için kullanılır.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Yetkili kişi" htmlFor="contactName">
                <Input id="contactName" name="contactName" placeholder="Ad Soyad" />
              </Field>
              <Field label="Telefon" htmlFor="phone">
                <Input id="phone" name="phone" type="tel" placeholder="05xx xxx xx xx" />
              </Field>
              <Field label="E-posta" htmlFor="email">
                <Input id="email" name="email" type="email" placeholder="iletisim@firma.com" />
              </Field>
              <Field label="Şehir" htmlFor="city">
                <Input id="city" name="city" placeholder="İstanbul" />
              </Field>
            </div>
            <Field label="Adres" htmlFor="address">
              <Input id="address" name="address" placeholder="Açık adres (opsiyonel)" />
            </Field>
          </Section>

          {/* Online mağaza */}
          <Section title="Online mağaza" desc="Logo ve site bilgilerin (sonradan da eklenebilir).">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Web sitesi" htmlFor="websiteUrl">
                <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://..." />
              </Field>
              <Field label="Logo URL" htmlFor="logoUrl">
                <Input id="logoUrl" name="logoUrl" type="url" placeholder="https://.../logo.png" />
              </Field>
            </div>
          </Section>

          {error && (
            <p className="rounded-md border border-[var(--rise)]/30 bg-[var(--rise)]/10 px-3 py-2 text-sm text-[var(--rise)]">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Gönderiliyor…" : "Başvuruyu gönder"}
            </Button>
            <span className="text-xs text-[var(--muted)]">
              Göndererek satıcı sözleşmesini kabul etmiş olursun.
            </span>
          </div>
        </form>
      </div>

      {/* Yan panel: avantajlar */}
      <aside className="h-fit rounded-lg border border-[var(--border)] bg-card p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-base font-bold">Neden FİYATBUL?</h2>
        <ul className="mt-3 space-y-2.5">
          {BENEFITS.map((b) => (
            <li key={b} className="flex gap-2 text-sm text-ink">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--save)]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-2 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
          <p className="flex items-center gap-2">
            <Globe className="size-4 text-[var(--brand)]" /> Üyelik ücretsiz, komisyon yok
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4 text-[var(--brand)]" /> Onay genelde 1 iş günü
          </p>
        </div>
      </aside>
    </div>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-card p-5">
      <h2 className="font-display text-base font-bold">{title}</h2>
      <p className="mb-4 mt-0.5 text-xs text-[var(--muted)]">{desc}</p>
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
