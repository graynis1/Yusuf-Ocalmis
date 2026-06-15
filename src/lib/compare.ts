"use client";

import * as React from "react";
import type { ProductCardData } from "@/components/product/product-card";

const KEY = "fb:compare";
const EVENT = "fb:compare-change";
export const COMPARE_CAP = 4;

export type CompareItem = Pick<
  ProductCardData,
  "slug" | "title" | "imageUrl" | "brandName" | "categorySlug" | "lowestPrice" | "offerCount"
>;

function read(): CompareItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CompareItem[]) : [];
  } catch {
    return [];
  }
}

function write(list: CompareItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* yoksay */
  }
}

export function isInCompare(slug: string): boolean {
  return read().some((p) => p.slug === slug);
}

/** Ekler/çıkarır. Dolu ise ve yeni ürünse false döner (eklenmedi). */
export function toggleCompare(item: CompareItem): boolean {
  const list = read();
  const exists = list.some((p) => p.slug === item.slug);
  if (exists) {
    write(list.filter((p) => p.slug !== item.slug));
    return false;
  }
  if (list.length >= COMPARE_CAP) return false;
  write([...list, item]);
  return true;
}

export function removeCompare(slug: string) {
  write(read().filter((p) => p.slug !== slug));
}

export function clearCompare() {
  write([]);
}

/** Karşılaştırma listesini canlı izleyen hook (sekmeler arası da senkron). */
export function useCompare(): CompareItem[] {
  const [items, setItems] = React.useState<CompareItem[]>([]);
  React.useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return items;
}
