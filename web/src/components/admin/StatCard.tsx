import React from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;

  const width = 80;
  const height = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      fill="none"
      className="h-7 w-20 shrink-0 text-accent/70"
    >
      <polyline
        points={points}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  trendLabel = "vs previous period",
  sparkline,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  sparkline?: number[];
}) {
  const positive = (trend ?? 0) >= 0;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
          {label}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
          {value}
        </p>
        {sparkline && <Sparkline data={sparkline} />}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {trend !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
              positive
                ? "bg-success-soft text-success"
                : "bg-danger-soft text-danger",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {trend !== undefined && <span className="text-xs text-ink-subtle">{trendLabel}</span>}
        {trend === undefined && hint && (
          <span className="text-xs text-ink-subtle">{hint}</span>
        )}
      </div>
    </div>
  );
}

export default StatCard;
