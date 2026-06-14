import type { FeedType } from "@prisma/client";
import type { MappingConfig } from "./types";

/**
 * Gerçek affiliate ağları için hazır mappingConfig preset'leri.
 * TODO: feed URL'i ve kimlik bilgileri admin panelinden girilene kadar PASİF.
 * URL boşken bu kaynaklar çalışmaz; site demo verisiyle dolu kalır.
 */
export interface FeedPreset {
  key: string;
  label: string;
  type: FeedType;
  note: string;
  mapping: MappingConfig;
}

export const FEED_PRESETS: FeedPreset[] = [
  {
    key: "google_shopping",
    label: "Google Shopping / Merchant Center",
    type: "GOOGLE_SHOPPING",
    note: "RSS 2.0 ürün feed'i. Merchant Center'dan feed URL'i alın.",
    mapping: {
      rootPath: "rss.channel.item",
      defaultCurrency: "TRY",
      fields: {
        externalId: "g:id",
        title: "title",
        url: "link",
        price: "g:price",
        oldPrice: "g:sale_price",
        imageUrl: "g:image_link",
        brand: "g:brand",
        gtin: "g:gtin",
        mpn: "g:mpn",
        category: "g:product_type",
        inStock: "g:availability",
      },
      attributeFields: ["g:color", "g:size", "g:material"],
    },
  },
  {
    key: "trendyol",
    label: "Trendyol (XML feed)",
    type: "XML",
    note: "TODO: Trendyol satıcı/affiliate feed URL'i admin panelinden girilecek.",
    mapping: {
      rootPath: "products.product",
      defaultCurrency: "TRY",
      fields: {
        externalId: "id",
        title: "name",
        url: "url",
        price: "price",
        oldPrice: "listPrice",
        imageUrl: "image",
        brand: "brand",
        gtin: "barcode",
        category: "category",
        inStock: "stock",
      },
      attributeFields: ["color", "size"],
    },
  },
  {
    key: "hepsiburada",
    label: "Hepsiburada (XML feed)",
    type: "XML",
    note: "TODO: Hepsiburada feed URL'i/kimlik bilgileri admin panelinden girilecek.",
    mapping: {
      rootPath: "root.item",
      defaultCurrency: "TRY",
      fields: {
        externalId: "sku",
        title: "title",
        url: "productUrl",
        price: "price",
        oldPrice: "originalPrice",
        imageUrl: "imageUrl",
        brand: "brand",
        gtin: "ean",
        category: "categoryPath",
        inStock: "availability",
      },
    },
  },
  {
    key: "n11",
    label: "n11 (XML feed)",
    type: "XML",
    note: "TODO: n11 feed URL'i admin panelinden girilecek.",
    mapping: {
      rootPath: "products.product",
      defaultCurrency: "TRY",
      fields: {
        externalId: "productId",
        title: "title",
        url: "url",
        price: "displayPrice",
        imageUrl: "picture",
        brand: "brand",
        category: "category",
      },
    },
  },
  {
    key: "amazon_tr",
    label: "Amazon TR (Google Shopping uyumlu)",
    type: "GOOGLE_SHOPPING",
    note: "TODO: Amazon TR PA-API/feed entegrasyonu admin panelinden girilecek.",
    mapping: {
      rootPath: "rss.channel.item",
      defaultCurrency: "TRY",
      fields: {
        externalId: "g:id",
        title: "title",
        url: "link",
        price: "g:price",
        imageUrl: "g:image_link",
        brand: "g:brand",
        gtin: "g:gtin",
        category: "g:product_type",
      },
    },
  },
];
