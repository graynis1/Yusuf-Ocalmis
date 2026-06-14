/** Senkron .env yükleyici (side-effect). seed.ts'te runner'dan ÖNCE import edilmeli ki
 *  Prisma Client kurulurken DATABASE_URL hazır olsun. tsx CJS modunda top-level await olmaz. */
import { readFileSync } from "node:fs";
import path from "node:path";

if (!process.env.DATABASE_URL) {
  try {
    const content = readFileSync(path.join(process.cwd(), ".env"), "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* .env yoksa env zaten dışarıdan gelmiştir */
  }
}
