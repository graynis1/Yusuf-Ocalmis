import type { FeedType } from "@prisma/client";
import type { FeedAdapter } from "../types";
import { xmlAdapter } from "./xml.adapter";
import { csvAdapter } from "./csv.adapter";
import { jsonAdapter } from "./json.adapter";
import { googleShoppingAdapter } from "./googleShopping.adapter";
import { demoAdapter } from "./demo.adapter";

export function getAdapter(type: FeedType): FeedAdapter {
  switch (type) {
    case "XML":
      return xmlAdapter;
    case "CSV":
      return csvAdapter;
    case "JSON":
      return jsonAdapter;
    case "GOOGLE_SHOPPING":
      return googleShoppingAdapter;
    case "DEMO":
      return demoAdapter;
    default:
      throw new Error(`Bilinmeyen feed tipi: ${type}`);
  }
}
