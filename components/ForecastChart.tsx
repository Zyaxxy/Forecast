"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SeriesPoint } from "@/lib/types";

type ForecastChartProps = {
  points: SeriesPoint[];
  loading: boolean;
};

function formatTick(value: string): string {
  return format(new Date(value), "MMM d HH:mm");
}

export function ForecastChart({ points, loading }: ForecastChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-300/60 bg-white/85 p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading series...</p>
      </section>
    );
  }

  if (!isMounted) {
    return (
      <section className="rounded-2xl border border-slate-300/60 bg-white/85 p-6 shadow-sm">
        <p className="text-sm text-slate-600">Preparing chart...</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-300/60 bg-white/85 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Generation Comparison</h2>
        <p className="text-xs text-slate-500">Missing forecast values are excluded and shown as gaps; sparse valid points appear as markers.</p>
      </div>
      <div className="h-[380px] w-full">
        <ResponsiveContainer>
          <LineChart data={points} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
            <XAxis
              dataKey="targetTime"
              tickFormatter={formatTick}
              minTickGap={32}
              tick={{ fontSize: 11, fill: "#334155" }}
            />
            <YAxis tick={{ fontSize: 11, fill: "#334155" }} label={{ value: "MW", angle: -90, position: "insideLeft" }} />
            <Tooltip
              formatter={(value, name) => {
                if (value === null || value === undefined) {
                  return ["missing", String(name)];
                }
                return [`${Number(value).toFixed(0)} MW`, String(name)];
              }}
              labelFormatter={(label) => format(new Date(String(label)), "yyyy-MM-dd HH:mm 'UTC'")}
              contentStyle={{ borderRadius: 12, borderColor: "#cbd5e1" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="actualGeneration"
              name="Actual Generation"
              stroke="#2563eb"
              strokeWidth={2.2}
              dot={{ r: 1.5, fill: "#2563eb", strokeWidth: 0 }}
              activeDot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive
            />
            <Line
              type="monotone"
              dataKey="forecastGeneration"
              name="Forecast Generation"
              stroke="#16a34a"
              strokeWidth={2.2}
              dot={{ r: 2, fill: "#16a34a", strokeWidth: 0 }}
              activeDot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
