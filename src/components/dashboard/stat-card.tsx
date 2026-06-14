export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-card p-5">
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className="tabular mt-1 font-display text-2xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-[var(--muted)]">{hint}</div>}
    </div>
  );
}
