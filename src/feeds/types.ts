import type { FeedSource } from "@prisma/client";

/** Kanonik ham ürün — tüm adapter'lar buna çevirir. */
export interface RawProduct {
  externalId: string;
  title: string;
  url: string;
  price: number;
  oldPrice?: number;
  currency?: string;
  imageUrl?: string;
  brand?: string;
  gtin?: string;
  mpn?: string;
  category?: string;
  inStock?: boolean;
  attributes?: Record<string, string>;
  raw: unknown;
}

export interface FeedAdapter {
  fetch(source: FeedSource): AsyncIterable<RawProduct>;
}

/** mappingConfig şekli: feed alan adı -> kanonik alan. */
export interface MappingConfig {
  fields: Partial<Record<keyof Omit<RawProduct, "raw" | "attributes">, string>>;
  attributeFields?: string[]; // bu feed alanları attributes'a aktarılır
  rootPath?: string; // XML/JSON içinde ürün listesinin yolu
  defaultCurrency?: string;
}
