import { normalizeGtin, normalizeMpn } from "./normalize";

export type MatchMethod = "GTIN" | "BRAND_MPN" | "FUZZY" | "MANUAL";

export interface MatchInput {
  title: string;
  brand?: string | null;
  gtin?: string | null;
  mpn?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
}

export interface FuzzyCandidate {
  productId: string;
  score: number; // 0..1 (pg_trgm similarity)
}

export type MatchDecision =
  | { action: "LINK"; productId: string; confidence: number; method: MatchMethod }
  | { action: "REVIEW"; candidates: FuzzyCandidate[]; confidence: number }
  | { action: "NEW"; confidence: number };

/** Eşik değerleri — spec'e göre. */
export const THRESHOLDS = {
  fuzzyLink: 0.55, // >= bu skor: doğrudan bağla
  reviewLow: 0.35, // [reviewLow, fuzzyLink) arası: insan incelemesi
};

/**
 * Saf karar fonksiyonu — DB'siz, test edilebilir.
 * Sıra: GTIN > brand+MPN > fuzzy > new.
 */
export function decideMatch(args: {
  gtinProductId?: string | null;
  brandMpnProductId?: string | null;
  fuzzyCandidates?: FuzzyCandidate[];
}): MatchDecision {
  if (args.gtinProductId) {
    return { action: "LINK", productId: args.gtinProductId, confidence: 1.0, method: "GTIN" };
  }
  if (args.brandMpnProductId) {
    return {
      action: "LINK",
      productId: args.brandMpnProductId,
      confidence: 0.95,
      method: "BRAND_MPN",
    };
  }

  const candidates = (args.fuzzyCandidates ?? [])
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);
  const best = candidates[0];

  if (!best) return { action: "NEW", confidence: 0 };

  if (best.score >= THRESHOLDS.fuzzyLink) {
    return { action: "LINK", productId: best.productId, confidence: best.score, method: "FUZZY" };
  }
  if (best.score >= THRESHOLDS.reviewLow) {
    return { action: "REVIEW", candidates: candidates.slice(0, 5), confidence: best.score };
  }
  return { action: "NEW", confidence: best.score };
}

/** matchOffer için bağımlılıklar — DB erişimi dışarıdan enjekte edilir (test edilebilir). */
export interface MatchDeps {
  findByGtin(gtin: string): Promise<string | null>;
  findByBrandMpn(brandId: string, mpn: string): Promise<string | null>;
  fuzzyCandidates(input: {
    categoryId?: string | null;
    brandId?: string | null;
    title: string;
  }): Promise<FuzzyCandidate[]>;
}

/** Bir offer'ı kanonik ürüne eşle. */
export async function matchOffer(input: MatchInput, deps: MatchDeps): Promise<MatchDecision> {
  const gtin = normalizeGtin(input.gtin);
  let gtinProductId: string | null = null;
  if (gtin) gtinProductId = await deps.findByGtin(gtin);

  let brandMpnProductId: string | null = null;
  const mpn = normalizeMpn(input.mpn);
  if (!gtinProductId && input.brandId && mpn) {
    brandMpnProductId = await deps.findByBrandMpn(input.brandId, mpn);
  }

  // GTIN otoriterdir: geçerli GTIN'i olup eşleşme bulunamayan teklif AYRI bir üründür.
  // Fuzzy yalnızca GTIN'siz (veya MPN'siz) tekliflerde devreye girer; aksi halde yanlış birleşme olur.
  let fuzzy: FuzzyCandidate[] = [];
  if (!gtinProductId && !brandMpnProductId && !gtin) {
    fuzzy = await deps.fuzzyCandidates({
      categoryId: input.categoryId,
      brandId: input.brandId,
      title: input.title,
    });
  }

  return decideMatch({ gtinProductId, brandMpnProductId, fuzzyCandidates: fuzzy });
}
