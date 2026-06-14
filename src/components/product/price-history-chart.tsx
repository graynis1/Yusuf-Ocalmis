"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";

export type PricePoint = { date: string; price: number };

export function PriceHistoryChart({ data }: { data: PricePoint[] }) {
  const [range, setRange] = React.useState<30 | 90>(30);

  const points = React.useMemo(() => {
    const cutoff = Date.now() - range * 24 * 60 * 60 * 1000;
    return data
      .filter((d) => new Date(d.date).getTime() >= cutoff)
      .map((d) => ({
        ...d,
        label: new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" }).format(
          new Date(d.date)
        ),
      }));
  }, [data, range]);

  const min = React.useMemo(() => {
    if (points.length === 0) return null;
    return points.reduce((m, p) => (p.price < m.price ? p : m), points[0]);
  }, [points]);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (points.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
        Bu ürün için henüz yeterli fiyat geçmişi yok.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Fiyat geçmişi</h3>
        <div className="flex gap-1 rounded-md border border-[var(--border)] p-0.5">
          {([30, 90] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
                range === r ? "bg-[var(--brand)] text-white" : "text-[var(--muted)]"
              }`}
            >
              {r} gün
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            tickLine={false}
            axisLine={false}
            width={60}
            tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
            domain={["dataMin - 100", "dataMax + 100"]}
          />
          <Tooltip
            formatter={(v: number) => [formatPrice(v), "Fiyat"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="var(--brand)"
            strokeWidth={2}
            fill="url(#priceFill)"
            isAnimationActive={!reduceMotion}
            animationDuration={600}
          />
          {min && (
            <ReferenceDot
              x={min.label}
              y={min.price}
              r={5}
              fill="var(--save)"
              stroke="#fff"
              strokeWidth={2}
              isFront
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      {min && (
        <p className="mt-2 text-xs text-[var(--muted)]">
          Son {range} günün en düşüğü:{" "}
          <span className="tabular font-semibold text-[var(--save)]">
            {formatPrice(min.price)}
          </span>
        </p>
      )}
    </div>
  );
}
