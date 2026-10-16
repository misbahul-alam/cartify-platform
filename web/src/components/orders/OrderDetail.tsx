"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  History,
  MapPin,
  Receipt,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb, Button, EmptyState, SkeletonBlock } from "@/components/ui";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/cn";
import type { Order } from "@/types";

const steps = ["pending", "processing", "paid", "shipped", "delivered"];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const money = (value: number) => `$${value.toFixed(2)}`;

export const OrderDetail: React.FC<{ orderId: string }> = ({ orderId }) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const fetchOrderById = useOrdersStore((state) => state.fetchOrderById);
  const cancelOrder = useOrdersStore((state) => state.cancelOrder);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace(`/signin?redirect=/orders/${orderId}`);
      return;
    }

    let active = true;
    fetchOrderById(orderId)
      .then((data) => {
        if (!active) return;
        setOrder(data);
        setLoading(false);
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        setError(getErrorMessage(fetchError, "Failed to load this order"));
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, router, orderId, fetchOrderById]);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order? This cannot be undone.")) return;
    setCancelling(true);
    setError(null);
    try {
      await cancelOrder(orderId);
      const refreshed = await fetchOrderById(orderId);
      setOrder(refreshed);
    } catch (cancelError: unknown) {
      setError(getErrorMessage(cancelError, "Failed to cancel this order"));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <SkeletonBlock className="mb-8 h-8 w-1/3" />
        <div className="grid gap-6 lg:grid-cols-3">
          <SkeletonBlock className="h-72 rounded-2xl lg:col-span-2" />
          <SkeletonBlock className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <EmptyState
        icon={XCircle}
        title="We could not find that order"
        description={
          error ?? "This order does not exist or is not linked to your account."
        }
        actionLabel="Back to your orders"
        actionHref="/orders"
      />
    );
  }

  const status = order.status.toLowerCase();
  const canCancel = status === "pending" || status === "processing";
  const subtotal = order.total_price;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;
  const activeIndex = steps.indexOf(status);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Orders", href: "/orders" },
          { label: `#${order.id.slice(0, 8)}` },
        ]}
      />

      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All orders
      </Link>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-subtle">
            Order
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink tabular-nums">
            #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Placed {formatDate(order.created_at)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {canCancel && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling…" : "Cancel order"}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-line px-6 py-4">
            <Receipt className="h-4 w-4 text-ink-subtle" />
            <h2 className="text-lg font-semibold text-ink">Items</h2>
          </div>

          <div className="divide-y divide-line px-6">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">{item.product_name}</p>
                  <p className="mt-0.5 text-xs text-ink-subtle">
                    Qty {item.quantity} · {money(item.product_price)} each
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-ink">
                  {money(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3.5 border-t border-line bg-surface-muted/50 px-6 py-5">
            <div className="flex items-center justify-between text-sm text-ink-muted">
              <span>Items</span>
              <span className="font-medium text-ink">{money(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-ink-muted">
              <span>Shipping</span>
              {shipping === 0 ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-success">
                  Free
                </span>
              ) : (
                <span className="font-medium text-ink">{money(shipping)}</span>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm font-semibold text-ink">Total</span>
              <span className="text-2xl font-semibold text-ink">
                {money(total)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink">Progress</h2>

            {status === "cancelled" ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-danger">
                <XCircle className="h-4 w-4" />
                This order was cancelled.
              </p>
            ) : (
              <ol className="mt-5 space-y-4">
                {steps.map((step, index) => {
                  const done = index <= activeIndex;
                  return (
                    <li key={step} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold capitalize",
                          done
                            ? "border-accent bg-accent text-white"
                            : "border-line-strong bg-surface text-ink-subtle",
                        )}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={cn(
                          "text-sm capitalize",
                          done ? "font-medium text-ink" : "text-ink-subtle",
                        )}
                      >
                        {step}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
              <MapPin className="h-4 w-4 text-ink-subtle" />
              Shipping to
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink-muted">
              {order.shipping_address}
            </p>
          </div>

          <Link
            href="/products"
            className="flex items-center justify-between rounded-2xl border border-line bg-surface px-6 py-4 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-muted"
          >
            <span className="flex items-center gap-2">
              <History className="h-4 w-4 text-ink-subtle" />
              Continue shopping
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
