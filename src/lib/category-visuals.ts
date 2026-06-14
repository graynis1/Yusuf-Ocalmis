/** Kategori → ikon anahtarı + degrade renkleri. Placeholder görseller için tutarlı görsel dil. */
export type CatVisual = { from: string; to: string; fg: string; icon: string };

const MAP: Record<string, CatVisual> = {
  "akilli-telefon": { from: "#EEF2FF", to: "#DCE4FF", fg: "#3D5AFE", icon: "smartphone" },
  dizustu: { from: "#ECFDF5", to: "#D1FAE5", fg: "#059669", icon: "laptop" },
  televizyon: { from: "#EFF6FF", to: "#DBEAFE", fg: "#2563EB", icon: "tv" },
  kulaklik: { from: "#FDF4FF", to: "#FAE8FF", fg: "#A21CAF", icon: "headphones" },
  "akilli-saat": { from: "#FFF7ED", to: "#FFEDD5", fg: "#EA580C", icon: "watch" },
  "oyun-konsolu": { from: "#F5F3FF", to: "#EDE9FE", fg: "#7C3AED", icon: "gamepad" },
  "beyaz-esya": { from: "#F0F9FF", to: "#E0F2FE", fg: "#0284C7", icon: "refrigerator" },
  "kucuk-ev-aletleri": { from: "#FEF2F2", to: "#FEE2E2", fg: "#DC2626", icon: "blender" },
  parfum: { from: "#FFF1F2", to: "#FFE4E6", fg: "#E11D48", icon: "sparkles" },
  ayakkabi: { from: "#F7FEE7", to: "#ECFCCB", fg: "#65A30D", icon: "footprints" },
};

const FALLBACK: CatVisual = { from: "#F1F5F9", to: "#E2E8F0", fg: "#475569", icon: "package" };

export function categoryVisual(slug?: string | null): CatVisual {
  if (!slug) return FALLBACK;
  return MAP[slug] ?? FALLBACK;
}
