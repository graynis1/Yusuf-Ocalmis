/** Başlık normalizasyonu — eşleştirme motorunun temeli. Saf fonksiyonlar (test edilebilir). */

/** Pazarlama/gürültü kelimeleri (TR). Eşleşmeye katkısı yok, atılır. */
export const STOPWORDS = new Set([
  "yeni", "orjinal", "orijinal", "ücretsiz", "kargo", "ucretsiz", "indirimli",
  "indirim", "kampanya", "model", "fırsat", "firsat", "outlet", "ithalat",
  "ithal", "garantili", "garanti", "stokta", "hızlı", "hizli", "teslimat",
  "aynı", "ayni", "gün", "gun", "şok", "sok", "süper", "super", "set",
  "resmi", "distribütör", "distributor", "faturalı", "faturali", "sıfır", "sifir",
  "en", "ve", "ile", "için", "icin",
]);

/** Türkçe küçük harf — toLocaleLowerCase('tr') ZORUNLU (İ/I sorunu). */
export function trLower(s: string): string {
  return s.toLocaleLowerCase("tr-TR");
}

/** Birim normalize: "128 gb" -> "128gb", "1.5 lt" -> "1.5lt". */
export function normalizeUnits(s: string): string {
  return s.replace(
    /(\d+(?:[.,]\d+)?)\s*(gb|tb|mb|ml|lt|kg|gr|cm|mm|mah|inch|inç|["]|l|g|w)(?![\p{L}\p{N}])/giu,
    (_m, num: string, unit: string) =>
      `${num.replace(",", ".")}${unit.toLowerCase().replace("inç", "inch").replace('"', "inch")}`
  );
}

/** Tam normalize edilmiş başlık metni. */
export function normalizeTitle(title: string): string {
  let s = trLower(title);
  s = s.normalize("NFKD").replace(/[̀-ͯ]/g, (m) => m); // aksanları koru ama birleştir
  s = normalizeUnits(s);
  // noktalama -> boşluk
  s = s.replace(/[^\p{L}\p{N}.]+/gu, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/** Anlamlı token listesi (stopword'süz, ≥2 karakter veya rakam içeren). */
export function tokenize(title: string): string[] {
  const normalized = normalizeTitle(title);
  return normalized
    .split(" ")
    .filter((t) => t.length > 0)
    .filter((t) => !STOPWORDS.has(t))
    .filter((t) => t.length >= 2 || /\d/.test(t));
}

/** Marka + model token'ı çıkar. Marka ipucu verilirse başlıktan ayıklanır. */
export function extractBrandModel(
  title: string,
  knownBrand?: string
): { brand?: string; model: string; tokens: string[] } {
  const tokens = tokenize(title);
  let brand = knownBrand ? trLower(knownBrand) : undefined;

  if (!brand && tokens.length) {
    // ilk token'ı marka adayı kabul et (kaba sezgi)
    brand = tokens[0];
  }

  const brandTokens = brand ? new Set(tokenize(brand)) : new Set<string>();
  const modelTokens = tokens.filter((t) => !brandTokens.has(t));

  return {
    brand,
    model: modelTokens.join(" "),
    tokens,
  };
}

/** İki normalize başlık arasında basit Jaccard token benzerliği (0..1). DB'siz hızlı ön-eleme. */
export function tokenSimilarity(a: string, b: string): number {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** GTIN normalize: sadece rakam, baştaki sıfırları koru, geçerli uzunluk (8/12/13/14). */
export function normalizeGtin(gtin?: string | null): string | undefined {
  if (!gtin) return undefined;
  const digits = gtin.replace(/\D/g, "");
  if ([8, 12, 13, 14].includes(digits.length)) return digits;
  return undefined;
}

/** MPN normalize: boşluk/tire temizle, küçük harf. */
export function normalizeMpn(mpn?: string | null): string | undefined {
  if (!mpn) return undefined;
  const s = trLower(mpn).replace(/[\s\-_]+/g, "");
  return s.length >= 3 ? s : undefined;
}
