import { createHash } from "node:crypto";

/** KVKK: IP'yi düz tutma, tuzlu hash'le. */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.NEXTAUTH_SECRET ?? "fiyatbul-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/** İstekten istemci IP'sini çıkar. */
export function getClientIp(headers: Headers): string | null {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip");
}
