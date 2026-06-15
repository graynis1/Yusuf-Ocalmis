import Link from "next/link";

const cols = [
  {
    title: "Keşfet",
    links: [
      { href: "/ara", label: "Tüm ürünler" },
      { href: "/", label: "Günün fırsatları" },
      { href: "/karsilastir", label: "Ürün karşılaştır" },
    ],
  },
  {
    title: "Satıcılar",
    links: [
      { href: "/satici/kayit", label: "Satıcı ol" },
      { href: "/satici/panel", label: "Satıcı paneli" },
    ],
  },
  {
    title: "Kurumsal",
    links: [
      { href: "/hakkimizda", label: "Hakkımızda" },
      { href: "/iletisim", label: "İletişim" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { href: "/gizlilik", label: "Gizlilik" },
      { href: "/kvkk", label: "KVKK" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-white">
      <div className="container grid grid-cols-2 gap-8 py-12 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display text-lg font-extrabold">
            FİYAT<span className="text-[var(--brand)]">BUL</span>
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Akıllı fiyat karşılaştırma. Daha az öde, daha çok kazan.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[var(--muted)] hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="container flex flex-wrap items-center justify-between gap-1 py-4 text-xs text-[var(--muted)]">
          <span>© 2025 FİYATBUL. Tüm hakları saklıdır.</span>
          <span>Yusuf Öcalmış</span>
        </div>
      </div>
    </footer>
  );
}
