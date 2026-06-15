import Link from "next/link";
import { Heart, LayoutDashboard, Store, User as UserIcon } from "lucide-react";
import { auth } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search/search-bar";
import { Button } from "@/components/ui/button";

async function getTopCategories() {
  try {
    return await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      take: 8,
      select: { name: true, slug: true },
    });
  } catch {
    return [];
  }
}

export async function Header() {
  const session = await auth().catch(() => null);
  const categories = await getTopCategories();
  const role = session?.user?.role;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0 font-display text-xl font-extrabold tracking-tight">
          FİYAT<span className="text-[var(--brand)]">BUL</span>
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBar />
        </div>

        <nav className="ml-auto flex items-center gap-1">
          {role === "ADMIN" && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <LayoutDashboard className="size-4" /> Admin
              </Link>
            </Button>
          )}
          {(role === "MERCHANT" || role === "ADMIN") && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/satici/panel">
                <Store className="size-4" /> Satıcı
              </Link>
            </Button>
          )}
          {session?.user ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/hesap">
                <Heart className="size-4" /> Hesabım
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/giris">
                  <UserIcon className="size-4" /> Giriş yap
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/satici/kayit">Satıcı ol</Link>
              </Button>
            </>
          )}
        </nav>
      </div>

      {/* Mobil arama */}
      <div className="container pb-3 md:hidden">
        <SearchBar />
      </div>

      {categories.length > 0 && (
        <div className="border-t border-[var(--border)] bg-white">
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
