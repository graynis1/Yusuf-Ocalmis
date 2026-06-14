"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

export function SideNav({ items, title }: { items: NavItem[]; title: string }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{title}</p>
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-[var(--brand)] text-white" : "text-ink hover:bg-[var(--surface)]"
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
