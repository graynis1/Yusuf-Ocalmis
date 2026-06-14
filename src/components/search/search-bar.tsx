"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Loader2, Package, Tag, Store } from "lucide-react";
import { cn } from "@/lib/utils";

type Suggestion =
  | { type: "product"; label: string; slug: string }
  | { type: "category"; label: string; slug: string }
  | { type: "brand"; label: string; slug: string };

const iconFor = { product: Package, category: Tag, brand: Store };
const hrefFor = (s: Suggestion) =>
  s.type === "product"
    ? `/urun/${s.slug}`
    : s.type === "category"
      ? `/kategori/${s.slug}`
      : `/marka/${s.slug}`;

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<Suggestion[]>([]);
  const [active, setActive] = React.useState(-1);
  const boxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (q.trim().length < 2) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as { suggestions: Suggestion[] };
          setItems(data.suggestions ?? []);
          setOpen(true);
        }
      } catch {
        /* iptal edildi */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(value: string) {
    if (!value.trim()) return;
    setOpen(false);
    router.push(`/ara?q=${encodeURIComponent(value.trim())}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || items.length === 0) {
      if (e.key === "Enter") submit(q);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && items[active]) router.push(hrefFor(items[active]));
      else submit(q);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(-1);
          }}
          onFocus={() => items.length && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Ürün, marka veya kategori ara…"
          aria-label="Ara"
          className="h-11 w-full rounded-full border border-[var(--border)] bg-white/5 pl-10 pr-10 text-sm text-ink placeholder:text-[var(--muted)] transition-colors focus-visible:outline-none focus-visible:border-[var(--brand)]/50 focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 focus-visible:bg-white/[0.07]"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-[var(--muted)]" />
        )}
      </div>

      {open && items.length > 0 && (
        <ul className="glass absolute z-50 mt-2 w-full animate-fade-up overflow-hidden rounded-xl shadow-2xl">
          {items.map((s, i) => {
            const Icon = iconFor[s.type];
            return (
              <li key={`${s.type}-${s.slug}`}>
                <Link
                  href={hrefFor(s)}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    active === i ? "bg-white/10" : "hover:bg-white/5"
                  )}
                >
                  <Icon className="size-4 text-[var(--muted)]" />
                  <span className="flex-1 truncate text-ink">{s.label}</span>
                  <span className="text-xs text-[var(--muted)]">
                    {s.type === "product" ? "Ürün" : s.type === "category" ? "Kategori" : "Marka"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
