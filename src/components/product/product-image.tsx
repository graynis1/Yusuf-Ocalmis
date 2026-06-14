import Image from "next/image";
import {
  Smartphone, Laptop, Tv, Headphones, Watch, Gamepad2, Refrigerator,
  Blend, Sparkles, Footprints, Package,
} from "lucide-react";
import { categoryVisual } from "@/lib/category-visuals";

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  smartphone: Smartphone, laptop: Laptop, tv: Tv, headphones: Headphones,
  watch: Watch, gamepad: Gamepad2, refrigerator: Refrigerator, blender: Blend,
  sparkles: Sparkles, footprints: Footprints, package: Package,
};

/**
 * Ürün görseli: gerçek imageUrl varsa (mağaza feed'i) onu gösterir;
 * yoksa kategori-bilinçli, tutarlı ve şık bir placeholder çizer (marka + ikon + degrade).
 */
export function ProductImage({
  src,
  alt,
  brand,
  categorySlug,
  sizes,
  priority,
}: {
  src?: string | null;
  alt: string;
  brand?: string | null;
  categorySlug?: string | null;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <div className="h-full w-full bg-white">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "240px"}
          priority={priority}
          className="object-contain p-3"
        />
      </div>
    );
  }

  const v = categoryVisual(categorySlug);
  const Icon = ICONS[v.icon] ?? Package;

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 p-4"
      style={{ background: `linear-gradient(135deg, ${v.from}, ${v.to})` }}
      aria-label={alt}
    >
      <Icon className="size-1/3 opacity-90" style={{ color: v.fg }} />
      {brand && (
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ color: v.fg }}>
          {brand}
        </span>
      )}
    </div>
  );
}
