import { describe, it, expect } from "vitest";
import {
  normalizeTitle,
  normalizeUnits,
  tokenize,
  tokenSimilarity,
  normalizeGtin,
  normalizeMpn,
  extractBrandModel,
  trLower,
} from "./normalize";

describe("trLower", () => {
  it("Türkçe İ/I dönüşümünü doğru yapar", () => {
    expect(trLower("İPHONE")).toBe("iphone");
    expect(trLower("ILGINÇ")).toBe("ılgınç");
  });
});

describe("normalizeUnits", () => {
  it("birimleri sayıya yapıştırır", () => {
    expect(normalizeUnits("128 gb")).toBe("128gb");
    expect(normalizeUnits("1,5 lt")).toBe("1.5lt");
    expect(normalizeUnits('55 inç')).toBe("55inch");
  });
});

describe("normalizeTitle", () => {
  it("küçük harf + noktalama temizler + boşluk sıkıştırır", () => {
    expect(normalizeTitle("Apple   iPhone 15  (128 GB) - Siyah!!!")).toBe(
      "apple iphone 15 128gb siyah"
    );
  });
});

describe("tokenize", () => {
  it("stopword'leri atar", () => {
    const tokens = tokenize("Yeni Orjinal Apple iPhone 15 Ücretsiz Kargo");
    expect(tokens).toContain("apple");
    expect(tokens).toContain("iphone");
    expect(tokens).toContain("15");
    expect(tokens).not.toContain("yeni");
    expect(tokens).not.toContain("kargo");
    expect(tokens).not.toContain("ücretsiz");
  });
});

describe("tokenSimilarity", () => {
  it("aynı ürünün farklı yazımları yüksek benzerlik verir", () => {
    const s = tokenSimilarity(
      "Apple iPhone 15 128GB Siyah",
      "iPhone 15 128 GB Apple Siyah Cep Telefonu"
    );
    expect(s).toBeGreaterThan(0.4);
  });
  it("alakasız ürünler düşük benzerlik verir", () => {
    const s = tokenSimilarity("Apple iPhone 15", "Samsung Buzdolabı No Frost");
    expect(s).toBeLessThan(0.2);
  });
});

describe("normalizeGtin", () => {
  it("geçerli uzunlukları kabul eder", () => {
    expect(normalizeGtin("8691234567890")).toBe("8691234567890");
    expect(normalizeGtin("0012345678905")).toBe("0012345678905");
  });
  it("geçersizleri reddeder", () => {
    expect(normalizeGtin("123")).toBeUndefined();
    expect(normalizeGtin(null)).toBeUndefined();
  });
});

describe("normalizeMpn", () => {
  it("boşluk ve tireleri temizler", () => {
    expect(normalizeMpn("MQ-AB 12_3")).toBe("mqab123");
  });
  it("çok kısa olanı reddeder", () => {
    expect(normalizeMpn("ab")).toBeUndefined();
  });
});

describe("extractBrandModel", () => {
  it("bilinen markayı modelden ayırır", () => {
    const r = extractBrandModel("Samsung Galaxy S24 Ultra 256GB", "Samsung");
    expect(r.brand).toBe("samsung");
    expect(r.model).toContain("galaxy");
    expect(r.model).not.toContain("samsung");
  });
});
