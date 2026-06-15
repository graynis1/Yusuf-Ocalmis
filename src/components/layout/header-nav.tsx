"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  Store,
  User as UserIcon,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Cat = { name: string; slug: string };

export function HeaderNav({
  role,
  loggedIn,
  categories,
}: {
  role: string | null;
  loggedIn: boolean;
  categories: Cat[];
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Rota değişince menüyü kapat
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Menü açıkken arka plan kaymasını engelle
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isAdmin = role === "ADMIN";
  const isMerchant = role === "MERCHANT" || role === "ADMIN";

  return (
    <>
      {/* Masaüstü aksiyonlar */}
      <nav className="hidden items-center gap-1 md:flex">
        {isAdmin && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <LayoutDashboard className="size-4" /> Admin
            </Link>
          </Button>
        )}
        {isMerchant && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/satici/panel">
              <Store className="size-4" /> Satıcı
            </Link>
          </Button>
        )}
        {loggedIn ? (
          <Button asChild variant="ghost" size="sm">
            <Link href="/hesap">
              <Heart className="size-4" /> Hesabım
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
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

      {/* Mobil: hesap kısayolu + hamburger */}
      <div className="flex items-center gap-1 md:hidden">
        <Button asChild variant="ghost" size="icon" aria-label={loggedIn ? "Hesabım" : "Giriş"}>
          <Link href={loggedIn ? "/hesap" : "/giris"}>
            {loggedIn ? <Heart className="size-5" /> : <UserIcon className="size-5" />}
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Menü"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobil slide-down menü */}
      {open && (
        <div className="fixed inset-0 top-16 z-50 md:hidden">
          <button
            aria-label="Kapat"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div className="animate-fade-up absolute inset-x-0 top-0 max-h-[80vh] overflow-y-auto border-b border-[var(--border)] bg-white p-4 shadow-lg">
            <div className="flex flex-col gap-1">
              {isAdmin && (
                <MobileLink href="/admin" icon={<LayoutDashboard className="size-4" />}>
                  Admin paneli
                </MobileLink>
              )}
              {isMerchant && (
                <MobileLink href="/satici/panel" icon={<Store className="size-4" />}>
                  Satıcı paneli
                </MobileLink>
              )}
              {loggedIn ? (
                <MobileLink href="/hesap" icon={<Heart className="size-4" />}>
                  Hesabım & favoriler
                </MobileLink>
              ) : (
                <>
                  <MobileLink href="/giris" icon={<UserIcon className="size-4" />}>
                    Giriş yap
                  </MobileLink>
                  <Link
                    href="/satici/kayit"
                    className="mt-1 flex h-11 items-center justify-center rounded-md bg-[var(--brand)] font-semibold text-white"
                  >
                    Satıcı ol
                  </Link>
                </>
              )}
            </div>

            {categories.length > 0 && (
              <div className="mt-4 border-t border-[var(--border)] pt-3">
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Kategoriler
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/kategori/${c.slug}`}
                      className="rounded-md px-3 py-2 text-sm text-ink hover:bg-[var(--surface)]"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MobileLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink hover:bg-[var(--surface)]"
    >
      {icon}
      {children}
    </Link>
  );
}
