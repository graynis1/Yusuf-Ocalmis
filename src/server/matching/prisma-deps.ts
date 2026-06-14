import { prisma } from "@/lib/prisma";
import { normalizeTitle } from "./normalize";
import type { FuzzyCandidate, MatchDeps } from "./match";

/** Prisma + pg_trgm tabanlı eşleştirme bağımlılıkları. */
export const prismaMatchDeps: MatchDeps = {
  async findByGtin(gtin) {
    const p = await prisma.product.findUnique({ where: { gtin }, select: { id: true } });
    return p?.id ?? null;
  },

  async findByBrandMpn(brandId, mpn) {
    const p = await prisma.product.findFirst({
      where: { brandId, mpn: { not: null } },
      select: { id: true, mpn: true },
    });
    // normalize karşılaştırması üst katmanda yapıldı; burada birebir mpn ararız
    if (p && p.mpn) {
      const norm = p.mpn.toLocaleLowerCase("tr-TR").replace(/[\s\-_]+/g, "");
      if (norm === mpn) return p.id;
    }
    const exact = await prisma.product.findFirst({
      where: { brandId, mpn },
      select: { id: true },
    });
    return exact?.id ?? null;
  },

  async fuzzyCandidates({ categoryId, brandId, title }): Promise<FuzzyCandidate[]> {
    const norm = normalizeTitle(title);
    if (!norm) return [];
    // pg_trgm similarity; aynı kategori (+varsa marka) içinde ara.
    const rows = await prisma.$queryRawUnsafe<{ id: string; score: number }[]>(
      `
      SELECT p.id, similarity(p."title", $1) AS score
      FROM "Product" p
      WHERE ($2::text IS NULL OR p."categoryId" = $2)
        AND ($3::text IS NULL OR p."brandId" = $3)
        AND similarity(p."title", $1) > 0.2
      ORDER BY score DESC
      LIMIT 5
      `,
      norm,
      categoryId ?? null,
      brandId ?? null
    );
    return rows.map((r) => ({ productId: r.id, score: Number(r.score) }));
  },
};
