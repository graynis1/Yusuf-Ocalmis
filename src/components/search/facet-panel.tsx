"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import type { Facets } from "@/server/search/search";
import { Button } from "@/components/ui/button";

export function FacetPanel({ facets }: { facets: Facets }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const selectedBrands = sp.getAll("marka");
  const minVal = sp.get("min") ?? "";
  const maxVal = sp.get("max") ?? "";

  const [min, setMin] = React.useState(minVal);
  const [max, setMax] = React.useState(maxVal);

  function update(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(sp.toString());
    mutate(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleMulti(key: string, value: string) {
    update((params) => {
      const current = params.getAll(key);
      params.delete(key);
      if (current.includes(value)) {
        current.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        [...current, value].forEach((v) => params.append(key, v));
      }
    });
  }

  const hasFilters = selectedBrands.length > 0 || minVal || maxVal || [...sp.keys()].some((k) => k.startsWith("attr_"));

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold">Filtreler</h3>
        {hasFilters && (
          <button
            onClick={() => router.push(pathname + (sp.get("q") ? `?q=${sp.get("q")}` : ""))}
            className="text-xs font-medium text-[var(--brand)]"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Fiyat aralığı */}
      <div>
        <h4 className="mb-2 text-sm font-semibold">Fiyat aralığı</h4>
        {facets.priceRange && (
          <p className="mb-2 text-xs text-[var(--muted)]">
            {formatPrice(facets.priceRange.min)} – {formatPrice(facets.priceRange.max)}
          </p>
        )}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="En az"
            className="h-9 w-full rounded-md border border-[var(--border)] px-2 text-sm"
          />
          <span className="text-[var(--muted)]">–</span>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="En çok"
            className="h-9 w-full rounded-md border border-[var(--border)] px-2 text-sm"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="mt-2 w-full"
          onClick={() =>
            update((params) => {
              if (min) params.set("min", min);
              else params.delete("min");
              if (max) params.set("max", max);
              else params.delete("max");
            })
          }
        >
          Uygula
        </Button>
      </div>

      {/* Kategoriler */}
      {facets.categories.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Kategori</h4>
          <ul className="space-y-1">
            {facets.categories.map((c) => (
              <li key={c.slug}>
                <button
                  onClick={() => router.push(`/kategori/${c.slug}`)}
                  className="flex w-full items-center justify-between rounded px-1 py-1 text-sm text-ink hover:text-[var(--brand)]"
                >
                  <span>{c.name}</span>
                  <span className="text-xs text-[var(--muted)]">{c.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Markalar */}
      {facets.brands.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Marka</h4>
          <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {facets.brands.map((b) => (
              <li key={b.slug}>
                <label className="flex cursor-pointer items-center justify-between rounded px-1 py-1 text-sm hover:bg-[var(--surface)]">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b.slug)}
                      onChange={() => toggleMulti("marka", b.slug)}
                      className="size-4 accent-[var(--brand)]"
                    />
                    {b.name}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{b.count}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dinamik attribute facetleri */}
      {Object.entries(facets.attributes).map(([key, values]) => (
        <div key={key}>
          <h4 className="mb-2 text-sm font-semibold capitalize">{key}</h4>
          <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
            {values.slice(0, 12).map((v) => {
              const paramKey = `attr_${key}`;
              const selected = sp.getAll(paramKey).includes(v.value);
              return (
                <li key={v.value}>
                  <label className="flex cursor-pointer items-center justify-between rounded px-1 py-1 text-sm hover:bg-[var(--surface)]">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleMulti(paramKey, v.value)}
                        className="size-4 accent-[var(--brand)]"
                      />
                      {v.value}
                    </span>
                    <span className="text-xs text-[var(--muted)]">{v.count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
