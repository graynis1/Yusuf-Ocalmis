"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select } from "@/components/ui/select";

const OPTIONS = [
  { value: "relevance", label: "En uygun" },
  { value: "price_asc", label: "Önce en ucuz" },
  { value: "price_desc", label: "Önce en pahalı" },
  { value: "popular", label: "Popülerlik" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("sort") ?? "relevance";

  return (
    <Select
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(sp.toString());
        params.set("sort", e.target.value);
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="w-44"
      aria-label="Sıralama"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
