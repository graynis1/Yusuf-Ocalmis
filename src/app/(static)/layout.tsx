export default function StaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-12">
      <article className="prose-fiyatbul mx-auto max-w-2xl space-y-4 [&_h1]:font-display [&_h1]:text-3xl [&_h1]:font-extrabold [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_p]:text-[var(--muted)] [&_li]:text-[var(--muted)]">
        {children}
      </article>
    </div>
  );
}
