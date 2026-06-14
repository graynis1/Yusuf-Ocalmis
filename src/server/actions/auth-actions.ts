"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/server/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta gir"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export type ActionState = { error?: string; ok?: boolean };

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler" };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Bu e-posta zaten kayıtlı. Giriş yapmayı dene." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash, role: "USER" } });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    return { ok: true };
  }
  return { ok: true };
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "E-posta ve şifre gerekli" };
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { ok: true };
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "E-posta veya şifre hatalı" };
    }
    throw e;
  }
}
