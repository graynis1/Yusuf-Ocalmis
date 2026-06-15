"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import { slugify } from "@/lib/utils";
import { getCurrentMerchant } from "@/server/merchant";
import { getAdapter } from "@/feeds/adapters";

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));
const optionalUrl = z.string().url().optional().or(z.literal(""));

const registerSchema = z.object({
  name: z.string().min(2, "Firma adı en az 2 karakter olmalı."),
  sector: optionalText,
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  contactName: optionalText,
  email: z.string().email("Geçerli bir e-posta gir.").optional().or(z.literal("")),
  phone: optionalText,
  taxId: optionalText,
  city: optionalText,
  address: z.string().trim().max(500).optional().or(z.literal("")),
  websiteUrl: optionalUrl,
  logoUrl: optionalUrl,
});

export async function registerMerchantAction(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Önce giriş yapmalısın." };

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    sector: formData.get("sector"),
    description: formData.get("description"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    taxId: formData.get("taxId"),
    city: formData.get("city"),
    address: formData.get("address"),
    websiteUrl: formData.get("websiteUrl"),
    logoUrl: formData.get("logoUrl"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." };
  }

  const existing = await prisma.merchant.findUnique({ where: { userId: session.user.id } });
  if (existing) return { error: "Zaten bir mağaza başvurun var." };

  let slug = slugify(parsed.data.name);
  const clash = await prisma.merchant.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const d = parsed.data;
  await prisma.merchant.create({
    data: {
      userId: session.user.id,
      name: d.name,
      slug,
      sector: d.sector || null,
      description: d.description || null,
      contactName: d.contactName || null,
      email: d.email || null,
      phone: d.phone || null,
      taxId: d.taxId || null,
      city: d.city || null,
      address: d.address || null,
      websiteUrl: d.websiteUrl || null,
      logoUrl: d.logoUrl || null,
      status: "PENDING",
      tier: "FREE",
    },
  });

  // kullanıcı rolünü MERCHANT yap
  await prisma.user.update({ where: { id: session.user.id }, data: { role: "MERCHANT" } });

  revalidatePath("/satici/panel");
  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().min(2, "Firma adı en az 2 karakter olmalı."),
  sector: optionalText,
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  contactName: optionalText,
  email: z.string().email("Geçerli bir e-posta gir.").optional().or(z.literal("")),
  phone: optionalText,
  taxId: optionalText,
  city: optionalText,
  address: z.string().trim().max(500).optional().or(z.literal("")),
  websiteUrl: optionalUrl,
  logoUrl: optionalUrl,
});

/** Satıcının kendi mağaza profilini güncellemesi. */
export async function updateMerchantProfileAction(_prev: unknown, formData: FormData) {
  const merchant = await getCurrentMerchant();
  if (!merchant) return { error: "Mağaza bulunamadı." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    sector: formData.get("sector"),
    description: formData.get("description"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    taxId: formData.get("taxId"),
    city: formData.get("city"),
    address: formData.get("address"),
    websiteUrl: formData.get("websiteUrl"),
    logoUrl: formData.get("logoUrl"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." };
  }

  const d = parsed.data;
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      name: d.name,
      sector: d.sector || null,
      description: d.description || null,
      contactName: d.contactName || null,
      email: d.email || null,
      phone: d.phone || null,
      taxId: d.taxId || null,
      city: d.city || null,
      address: d.address || null,
      websiteUrl: d.websiteUrl || null,
      logoUrl: d.logoUrl || null,
    },
  });

  revalidatePath("/satici/profil");
  revalidatePath(`/magaza/${merchant.slug}`);
  return { ok: true };
}

const feedSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["XML", "CSV", "JSON", "GOOGLE_SHOPPING"]),
  url: z.string().url(),
  mappingConfig: z.string(), // JSON string
});

export async function saveFeedAction(_prev: unknown, formData: FormData) {
  const merchant = await getCurrentMerchant();
  if (!merchant) return { error: "Mağaza bulunamadı." };
  if (merchant.status !== "APPROVED") {
    return { error: "Mağazan henüz onaylanmadı. Onay sonrası feed bağlayabilirsin." };
  }

  const parsed = feedSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    url: formData.get("url"),
    mappingConfig: formData.get("mappingConfig"),
  });
  if (!parsed.success) return { error: "Geçersiz feed bilgileri." };

  let mapping: Prisma.InputJsonValue;
  try {
    mapping = JSON.parse(parsed.data.mappingConfig);
  } catch {
    return { error: "Eşleme yapılandırması geçerli JSON değil." };
  }

  const feedId = formData.get("feedId");
  if (feedId && typeof feedId === "string") {
    await prisma.feedSource.update({
      where: { id: feedId },
      data: { name: parsed.data.name, type: parsed.data.type, url: parsed.data.url, mappingConfig: mapping },
    });
  } else {
    await prisma.feedSource.create({
      data: {
        merchantId: merchant.id,
        name: parsed.data.name,
        type: parsed.data.type,
        url: parsed.data.url,
        mappingConfig: mapping,
      },
    });
  }
  revalidatePath("/satici/feeds");
  return { ok: true };
}

/** Feed'in ilk 10 kalemini önizle (test et). */
export async function testFeedAction(
  type: "XML" | "CSV" | "JSON" | "GOOGLE_SHOPPING",
  url: string,
  mappingConfigJson: string
) {
  const merchant = await getCurrentMerchant();
  if (!merchant) return { error: "Mağaza bulunamadı." };
  let mapping: unknown;
  try {
    mapping = JSON.parse(mappingConfigJson);
  } catch {
    return { error: "Eşleme JSON geçersiz." };
  }
  try {
    const adapter = getAdapter(type);
    const fakeSource = {
      id: "test",
      merchantId: merchant.id,
      name: "test",
      type,
      url,
      mappingConfig: mapping,
      enabled: true,
      schedule: "hourly",
      lastRunAt: null,
      lastStatus: null,
      lastError: null,
      itemCount: 0,
      createdAt: new Date(),
    } as never;
    const preview: unknown[] = [];
    for await (const item of adapter.fetch(fakeSource)) {
      preview.push(item);
      if (preview.length >= 10) break;
    }
    return { ok: true, preview };
  } catch (e) {
    return { error: `Feed okunamadı: ${(e as Error).message}` };
  }
}

export async function deleteFeedAction(feedId: string) {
  const merchant = await getCurrentMerchant();
  if (!merchant) return { error: "Mağaza bulunamadı." };
  await prisma.feedSource.deleteMany({ where: { id: feedId, merchantId: merchant.id } });
  revalidatePath("/satici/feeds");
  return { ok: true };
}

export async function changeTierAction(tier: "FREE" | "PRO" | "PREMIUM") {
  const merchant = await getCurrentMerchant();
  if (!merchant) return { error: "Mağaza bulunamadı." };
  // Banka havalesi varsayılan: abonelik "pending" olarak işaretlenir, admin onaylar.
  await prisma.subscription.upsert({
    where: { merchantId: merchant.id },
    create: { merchantId: merchant.id, tier, status: tier === "FREE" ? "active" : "pending" },
    update: { tier, status: tier === "FREE" ? "active" : "pending" },
  });
  if (tier === "FREE") {
    await prisma.merchant.update({ where: { id: merchant.id }, data: { tier } });
  }
  revalidatePath("/satici/abonelik");
  return { ok: true, pending: tier !== "FREE" };
}
