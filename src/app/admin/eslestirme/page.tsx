import { prisma } from "@/lib/prisma";
import { MatchQueue, type ReviewItem } from "@/components/admin/match-queue";

export const dynamic = "force-dynamic";

type Candidate = { productId: string; score: number };

export default async function AdminMatchQueuePage() {
  const reviews = await prisma.matchReview.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 50,
    include: {
      offer: {
        select: {
          id: true,
          title: true,
          price: true,
          imageUrl: true,
          merchant: { select: { name: true } },
        },
      },
    },
  });

  // aday ürün detaylarını topla
  const allProductIds = new Set<string>();
  for (const r of reviews) {
    for (const c of (r.candidates as unknown as Candidate[]) ?? []) allProductIds.add(c.productId);
  }
  const products = await prisma.product.findMany({
    where: { id: { in: [...allProductIds] } },
    select: { id: true, title: true, imageUrl: true, lowestPrice: true },
  });
  const pmap = new Map(products.map((p) => [p.id, p]));

  const items: ReviewItem[] = reviews.map((r) => ({
    reviewId: r.id,
    offerId: r.offer.id,
    offerTitle: r.offer.title,
    offerPrice: Number(r.offer.price),
    offerImage: r.offer.imageUrl,
    merchantName: r.offer.merchant.name,
    confidence: r.confidence,
    candidates: ((r.candidates as unknown as Candidate[]) ?? [])
      .map((c) => {
        const p = pmap.get(c.productId);
        return p
          ? {
              productId: c.productId,
              score: c.score,
              title: p.title,
              imageUrl: p.imageUrl,
              lowestPrice: p.lowestPrice ? Number(p.lowestPrice) : null,
            }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null),
  }));

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold">Eşleştirme kuyruğu</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Belirsiz eşleşmeleri incele: doğru ürünle birleştir, yeni ürün oluştur ya da reddet.
      </p>
      <MatchQueue items={items} />
    </div>
  );
}
