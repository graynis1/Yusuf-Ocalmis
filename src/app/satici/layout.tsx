import { SideNav } from "@/components/dashboard/side-nav";

const NAV = [
  { href: "/satici/panel", label: "Panel" },
  { href: "/satici/feeds", label: "Feed'ler" },
  { href: "/satici/listings", label: "Listingler" },
  { href: "/satici/analytics", label: "Analitik" },
  { href: "/satici/abonelik", label: "Abonelik" },
];

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container grid grid-cols-1 gap-8 py-8 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <SideNav title="Satıcı paneli" items={NAV} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
