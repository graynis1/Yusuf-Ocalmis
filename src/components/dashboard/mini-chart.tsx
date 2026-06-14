"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export function MiniChart({ data, label = "Değer" }: { data: { date: string; value: number }[]; label?: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
        Henüz veri yok.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="miniFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
        <Tooltip formatter={(v: number) => [v, label]} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
        <Area type="monotone" dataKey="value" stroke="var(--brand)" strokeWidth={2} fill="url(#miniFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
