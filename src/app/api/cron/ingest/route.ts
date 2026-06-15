import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { runDueFeeds } from "@/feeds/runner";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev'de açık
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const results = await runDueFeeds();
    // Yeni fiyatlar geldi → ana sayfa/kategori cache'ini tazele
    revalidateTag("catalog");
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
