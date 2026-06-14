import { SideNav } from "@/components/dashboard/side-nav";

const NAV = [
  { href: "/admin", label: "Genel bakış" },
  { href: "/admin/magazalar", label: "Mağaza onayları" },
  { href: "/admin/eslestirme", label: "Eşleştirme kuyruğu" },
  { href: "/admin/urunler", label: "Ürünler" },
  { href: "/admin/kategoriler", label: "Kategoriler" },
  { href: "/admin/markalar", label: "Markalar" },
  { href: "/admin/feeds", label: "Feed monitörü" },
  { href: "/admin/sponsorlu", label: "Sponsorlu" },
  { href: "/admin/kullanicilar", label: "Kullanıcılar" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container grid grid-cols-1 gap-8 py-8 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <SideNav title="Admin" items={NAV} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
