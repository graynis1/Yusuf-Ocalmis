import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  total,
  pageSize,
  makeHref,
}: {
  page: number;
  total: number;
  pageSize: number;
  makeHref: (page: number) => string;
}) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  const window = 2;
  const start = Math.max(1, page - window);
  const end = Math.min(pages, page + window);
  const items: number[] = [];
  for (let i = start; i <= end; i++) items.push(i);

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Sayfalama">
      {page > 1 && (
        <Link href={makeHref(page - 1)} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface)]">
          Önceki
        </Link>
      )}
      {start > 1 && (
        <>
          <Link href={makeHref(1)} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm">1</Link>
          {start > 2 && <span className="px-1 text-[var(--muted)]">…</span>}
        </>
      )}
      {items.map((i) => (
        <Link
          key={i}
          href={makeHref(i)}
          className={cn(
            "rounded-md border px-3 py-2 text-sm",
            i === page
              ? "border-[var(--brand)] bg-[var(--brand)] text-white"
              : "border-[var(--border)] hover:bg-[var(--surface)]"
          )}
        >
          {i}
        </Link>
      ))}
      {end < pages && (
        <>
          {end < pages - 1 && <span className="px-1 text-[var(--muted)]">…</span>}
          <Link href={makeHref(pages)} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm">{pages}</Link>
        </>
      )}
      {page < pages && (
        <Link href={makeHref(page + 1)} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface)]">
          Sonraki
        </Link>
      )}
    </nav>
  );
}
