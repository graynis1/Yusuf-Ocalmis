import { describe, it, expect } from "vitest";
import { decideMatch, matchOffer, THRESHOLDS, type MatchDeps } from "./match";

describe("decideMatch", () => {
  it("GTIN eşleşmesi 1.0 güvenle bağlar", () => {
    const d = decideMatch({ gtinProductId: "p1" });
    expect(d).toEqual({ action: "LINK", productId: "p1", confidence: 1.0, method: "GTIN" });
  });

  it("brand+MPN eşleşmesi 0.95 güvenle bağlar", () => {
    const d = decideMatch({ brandMpnProductId: "p2" });
    expect(d).toEqual({ action: "LINK", productId: "p2", confidence: 0.95, method: "BRAND_MPN" });
  });

  it("GTIN, brand+MPN'den önce gelir", () => {
    const d = decideMatch({ gtinProductId: "p1", brandMpnProductId: "p2" });
    expect(d.action).toBe("LINK");
    if (d.action === "LINK") expect(d.method).toBe("GTIN");
  });

  it("yüksek fuzzy skor (>=0.55) doğrudan bağlar", () => {
    const d = decideMatch({ fuzzyCandidates: [{ productId: "p3", score: 0.72 }] });
    expect(d.action).toBe("LINK");
    if (d.action === "LINK") {
      expect(d.method).toBe("FUZZY");
      expect(d.productId).toBe("p3");
      expect(d.confidence).toBeCloseTo(0.72);
    }
  });

  it("orta fuzzy skor (0.35-0.55) review kuyruğuna gönderir", () => {
    const d = decideMatch({ fuzzyCandidates: [{ productId: "p4", score: 0.45 }] });
    expect(d.action).toBe("REVIEW");
    if (d.action === "REVIEW") expect(d.candidates[0].productId).toBe("p4");
  });

  it("düşük fuzzy skor (<0.35) yeni ürün oluşturur", () => {
    const d = decideMatch({ fuzzyCandidates: [{ productId: "p5", score: 0.2 }] });
    expect(d.action).toBe("NEW");
  });

  it("aday yoksa yeni ürün oluşturur", () => {
    expect(decideMatch({}).action).toBe("NEW");
  });

  it("en yüksek skorlu adayı seçer", () => {
    const d = decideMatch({
      fuzzyCandidates: [
        { productId: "a", score: 0.4 },
        { productId: "b", score: 0.8 },
        { productId: "c", score: 0.6 },
      ],
    });
    if (d.action === "LINK") expect(d.productId).toBe("b");
  });

  it("eşik sınır değerleri doğru", () => {
    expect(decideMatch({ fuzzyCandidates: [{ productId: "x", score: THRESHOLDS.fuzzyLink }] }).action).toBe("LINK");
    expect(decideMatch({ fuzzyCandidates: [{ productId: "x", score: THRESHOLDS.reviewLow }] }).action).toBe("REVIEW");
    expect(decideMatch({ fuzzyCandidates: [{ productId: "x", score: THRESHOLDS.reviewLow - 0.01 }] }).action).toBe("NEW");
  });
});

describe("matchOffer (enjekte edilen deps ile)", () => {
  const baseDeps: MatchDeps = {
    findByGtin: async () => null,
    findByBrandMpn: async () => null,
    fuzzyCandidates: async () => [],
  };

  it("geçerli GTIN ile GTIN yolunu kullanır", async () => {
    const deps: MatchDeps = { ...baseDeps, findByGtin: async () => "g1" };
    const d = await matchOffer({ title: "x", gtin: "8691234567890" }, deps);
    expect(d.action).toBe("LINK");
    if (d.action === "LINK") expect(d.method).toBe("GTIN");
  });

  it("geçersiz GTIN'i atlar, fuzzy'ye düşer", async () => {
    const deps: MatchDeps = {
      ...baseDeps,
      findByGtin: async () => "should-not-be-called",
      fuzzyCandidates: async () => [{ productId: "f1", score: 0.9 }],
    };
    const d = await matchOffer({ title: "x", gtin: "12" }, deps);
    if (d.action === "LINK") expect(d.method).toBe("FUZZY");
  });

  it("GTIN bulunamazsa brand+MPN dener", async () => {
    const deps: MatchDeps = {
      ...baseDeps,
      findByBrandMpn: async () => "bm1",
    };
    const d = await matchOffer({ title: "x", brandId: "b1", mpn: "MQAB123" }, deps);
    if (d.action === "LINK") expect(d.method).toBe("BRAND_MPN");
  });
});
