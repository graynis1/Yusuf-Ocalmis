import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Bell } from "lucide-react";
import { auth } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/server/actions/session-actions";
import { formatPrice } from "@/lib/utils";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { AlertList } from "@/components/account/alert-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hesabım" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris?next=/hesap");
  const userId = session.user.id;

  const [favorites, alerts] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            slug: true, title: true, imageUrl: true, lowestPrice: true, offerCount: true,
            brand: { select: { name: true } },
          },
        },
      },
    }),
    prisma.priceAlert.findMany({
      where: { userId, active: true },
      orderBy: { createdAt: "desc" },
      include: { product: { select: { slug: true, title: true, lowestPrice: true } } },
    }),
  ]);

  const favProducts = favorites.map((f) => ({
    slug: f.product.slug,
    title: f.product.title,
    imageUrl: f.product.imageUrl,
    brandName: f.product.brand?.name ?? null,
    lowestPrice: f.product.lowestPrice ? Number(f.product.lowestPrice) : null,
    offerCount: f.product.offerCount,
  }));

  const alertItems = alerts.map((a) => ({
    productSlug: a.product.slug,
    productTitle: a.product.title,
    targetPrice: Number(a.targetPrice),
    currentPrice: a.product.lowestPrice ? Number(a.product.lowestPrice) : null,
  }));

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Merhaba, {session.user.name ?? "kullanıcı"}</h1>
          <p className="text-sm text-[var(--muted)]">{session.user.email}</p>
        </div>
        <form action={logoutAction}>
          <Button variant="outline" type="submit">Çıkış yap</Button>
        </form>
      </div>

      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="size-5 text-[var(--brand)]" />
          <h2 className="font-display text-lg font-bold">Fiyat alarmlarım</h2>
        </div>
        {alertItems.length > 0 ? (
          <AlertList alerts={alertItems} />
        ) : (
          <p className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            Henüz fiyat alarmın yok. Bir ürün sayfasından alarm kurabilirsin.
          </p>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Heart className="size-5 text-[var(--rise)]" />
          <h2 className="font-display text-lg font-bold">Favorilerim</h2>
        </div>
        {favProducts.length > 0 ? (
          <ProductGrid products={favProducts} />
        ) : (
          <p className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            Favori ürünün yok.{" "}
            <Link href="/ara" className="text-[var(--brand)]">Ürünlere göz at →</Link>
          </p>
        )}
      </section>
    </div>
  );
}
