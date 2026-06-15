"use client";

import * as React from "react";
import { GitCompare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COMPARE_CAP,
  toggleCompare,
  useCompare,
  type CompareItem,
} from "@/lib/compare";

/** Ürün detayında "Karşılaştırmaya ekle" butonu. */
export function CompareButton({ item }: { item: CompareItem }) {
  const list = useCompare();
  const inList = list.some((p) => p.slug === item.slug);
  const full = list.length >= COMPARE_CAP && !inList;

  return (
    <Button
      type="button"
      variant={inList ? "save" : "outline"}
      onClick={() => toggleCompare(item)}
      disabled={full}
      aria-pressed={inList}
      title={full ? `En fazla ${COMPARE_CAP} ürün karşılaştırılır` : undefined}
    >
      {inList ? <Check className="size-4" /> : <GitCompare className="size-4" />}
      {inList ? "Karşılaştırmada" : "Karşılaştır"}
    </Button>
  );
}
