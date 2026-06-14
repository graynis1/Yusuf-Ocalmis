import type { MappingConfig, RawProduct } from "./types";

function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  // "1.299,00 TL" / "1299.00" / "1,299.00" gibi biçimleri tolere et
  const s = String(v)
    .replace(/[^\d.,-]/g, "")
    .trim();
  if (!s) return undefined;
  let normalized = s;
  if (s.includes(",") && s.includes(".")) {
    // son ayraç ondalık kabul edilir
    normalized = s.lastIndexOf(",") > s.lastIndexOf(".")
      ? s.replace(/\./g, "").replace(",", ".")
      : s.replace(/,/g, "");
  } else if (s.includes(",")) {
    normalized = s.replace(",", ".");
  }
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

function str(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

function pick(record: Record<string, unknown>, key?: string): unknown {
  if (!key) return undefined;
  if (key in record) return record[key];
  // noktalı yol desteği: "g:price"
  return record[key.trim()];
}

/** Tek bir ham feed kaydını mappingConfig ile RawProduct'a çevirir. */
export function mapRecord(
  record: Record<string, unknown>,
  config: MappingConfig
): RawProduct | null {
  const f = config.fields;
  const externalId = str(pick(record, f.externalId));
  const title = str(pick(record, f.title));
  const url = str(pick(record, f.url));
  const price = num(pick(record, f.price));

  if (!externalId || !title || !url || price === undefined) return null;

  const attributes: Record<string, string> = {};
  for (const af of config.attributeFields ?? []) {
    const val = str(pick(record, af));
    if (val) attributes[af] = val;
  }

  const stockRaw = str(pick(record, f.inStock));
  const inStock = stockRaw
    ? !/(out|yok|tükendi|false|0|no)/i.test(stockRaw)
    : true;

  return {
    externalId,
    title,
    url,
    price,
    oldPrice: num(pick(record, f.oldPrice)),
    currency: str(pick(record, f.currency)) ?? config.defaultCurrency ?? "TRY",
    imageUrl: str(pick(record, f.imageUrl)),
    brand: str(pick(record, f.brand)),
    gtin: str(pick(record, f.gtin)),
    mpn: str(pick(record, f.mpn)),
    category: str(pick(record, f.category)),
    inStock,
    attributes: Object.keys(attributes).length ? attributes : undefined,
    raw: record,
  };
}
