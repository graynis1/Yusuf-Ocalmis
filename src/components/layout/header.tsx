import Link from "next/link";
import { auth } from "@/server/auth";
import { getNavCategoriesCached } from "@/server/cached";
import { SearchBar } from "@/components/search/search-bar";
import { HeaderNav } from "./header-nav";

export async function Header() {
  const [session, categories] = await Promise.all([
    auth().catch(() => null),
    getNavCategoriesCached(8).catch(() => []),
  ]);
  const role = session?.user?.role ?? null;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white">
      <div className="container flex h-16 items-center gap-3">
        <Link
          href="/"
          className="shrink-0 font-display text-lg font-extrabold tracking-tight sm:text-xl"
        >
          FİYAT<span className="text-[var(--brand)]">BUL</span>
        </Link>

        {/* Masaüstü arama */}
        <div className="hidden flex-1 md:block">
          <SearchBar />
        </div>

        {/* Sağ aksiyonlar + mobil menü (client) */}
        <div className="ml-auto">
          <HeaderNav
            role={role}
            loggedIn={Boolean(session?.user)}
            categories={categories}
          />
        </div>
      </div>

      {/* Mobil arama */}
      <div className="container pb-3 md:hidden">
        <SearchBar />
      </div>

      {/* Masaüstü kategori şeridi */}
      {categories.length > 0 && (
        <div className="hidden border-t border-[var(--border)] bg-white md:block">
          <nav className="container flex items-center gap-1 overflow-x-auto py-2 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/kategori/${c.slug}`}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-ink"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
