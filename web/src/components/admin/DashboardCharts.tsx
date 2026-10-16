"use client";

import React, { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { Pill, orderStatusTone } from "./Pill";
import { cn } from "@/lib/cn";
import { formatCompactPrice, formatPrice } from "@/lib/format";
import type { Order } from "@/types";

const statusOrder: Order["status"][] = [
  "pending",
  "processing",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

const statusBar: Record<string, string> = {
  pending: "bg-warning",
  processing: "bg-accent/50",
  paid: "bg-success",
  shipped: "bg-accent",
  delivered: "bg-success/70",
  cancelled: "bg-danger",
};

export const RevenueTrend: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const data = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayMs = 86_400_000;

    const slots = Array.from({ length: 28 }, (_, index) => {
      const date = new Date(today.getTime() - (27 - index) * dayMs);
      return {
        key: date.getTime(),
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        total: 0,
        count: 0,
      };
    });

    const index = new Map(
      slots.map((slot, position) => [slot.key, position]),
    );

    for (const order of orders) {
      const placed = new Date(order.created_at);
      placed.setHours(0, 0, 0, 0);
      const position = index.get(placed.getTime());
      if (position === undefined) continue;
      slots[position].total += order.total_price;
      slots[position].count += 1;
    }

    const recent = slots.slice(14);
    const previousTotal = slots
      .slice(0, 14)
      .reduce((sum, slot) => sum + slot.total, 0);
    const windowTotal = recent.reduce((sum, slot) => sum + slot.total, 0);

    return {
      recent,
      windowTotal,
      peak: Math.max(...recent.map((slot) => slot.total), 1),
      trend:
        previousTotal === 0
          ? windowTotal > 0
            ? 100
            : 0
          : ((windowTotal - previousTotal) / previousTotal) * 100,
    };
  }, [orders]);

  const positive = data.trend >= 0;

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <TrendingUp className="h-4 w-4 text-accent" />
            Revenue
          </h2>
          <p className="mt-1 text-xs text-ink-subtle">Last 14 days</p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
            {formatPrice(data.windowTotal)}
          </p>
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1 text-xs font-medium tabular-nums",
              positive ? "text-success" : "text-danger",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(data.trend).toFixed(1)}% vs previous 14 days
          </span>
        </div>
      </div>

      <div className="relative mt-6 h-44">
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="border-t border-line/70" />
          ))}
        </div>

        <span className="absolute -top-1 right-0 text-[10px] text-ink-subtle/80">
          peak {formatCompactPrice(data.peak)}
        </span>

        <div className="relative flex h-full items-end gap-1.5">
          {data.recent.map((slot) => (
            <div
              key={slot.key}
              className="group flex h-full flex-1 items-end"
              title={`${slot.label} · ${formatPrice(slot.total)} · ${
                slot.count
              } ${slot.count === 1 ? "order" : "orders"}`}
            >
              <div
                className={cn(
                  "w-full rounded-t-md transition-colors",
                  slot.total > 0
                    ? "bg-accent/70 group-hover:bg-accent"
                    : "bg-surface-muted",
                )}
                style={{
                  height: `${Math.max(
                    (slot.total / data.peak) * 100,
                    slot.total > 0 ? 6 : 2,
                  )}%`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-ink-subtle">
        <span>{data.recent[0].label}</span>
        <span>{data.recent[6].label}</span>
        <span>{data.recent[13].label}</span>
      </div>
    </div>
  );
};

export const StatusBreakdown: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const rows = useMemo(
    () =>
      statusOrder.map((status) => ({
        status,
        count: orders.filter((order) => order.status === status).length,
      })),
    [orders],
  );

  const total = orders.length || 1;

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-lg font-semibold text-ink">Orders by status</h2>
      <p className="mt-1 text-xs text-ink-subtle">
        {orders.length} {orders.length === 1 ? "order" : "orders"} in total
      </p>

      <ul className="mt-5 space-y-3.5">
        {rows.map(({ status, count }) => (
          <li key={status}>
            <div className="flex items-center justify-between gap-3">
              <Pill tone={orderStatusTone[status] || "neutral"}>{status}</Pill>
              <span className="text-sm font-medium text-ink tabular-nums">
                {count}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className={cn("h-full rounded-full", statusBar[status])}
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const TopProducts: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const products = useMemo(() => {
    const map = new Map<string, { units: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items ?? []) {
        const current = map.get(item.product_name) ?? { units: 0, revenue: 0 };
        current.units += item.quantity;
        current.revenue += item.subtotal;
        map.set(item.product_name, current);
      }
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const peak = products[0]?.revenue ?? 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 className="text-lg font-semibold text-ink">Top products</h2>
        <span className="text-xs text-ink-subtle">by revenue</span>
      </div>

      {products.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-ink-muted">
          No sales recorded yet.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {products.map((product, position) => (
            <li key={product.name} className="flex items-center gap-4 px-6 py-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-ink-muted tabular-nums">
                {position + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {product.name}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(product.revenue / peak) * 100}%` }}
                  />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium text-ink tabular-nums">
                  {formatPrice(product.revenue)}
                </p>
                <p className="text-xs text-ink-subtle tabular-nums">
                  {product.units} sold
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

