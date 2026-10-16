"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, History, XCircle } from "lucide-react";
import {
  Breadcrumb,
  EmptyState,
  SkeletonBlock,
  SkeletonRow,
} from "@/components/ui";
import { OrderStatusBadge } from "./OrderStatusBadge";
import type { Order } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { getErrorMessage } from "@/lib/errors";

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

export const OrderHistory: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const orders = useOrdersStore((state) => state.orders);
  const loading = useOrdersStore((state) => state.loading);
  const error = useOrdersStore((state) => state.error);
  const fetchOrders = useOrdersStore((state) => state.fetchOrders);
  const cancelOrder = useOrdersStore((state) => state.cancelOrder);

  useEffect(() => {
    if (!user) {
      router.push("/signin?redirect=/orders");
      return;
    }
    fetchOrders(1, 50);
  }, [user, router, fetchOrders]);

  const handleCancelOrder = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await cancelOrder(id);
    } catch (cancelError: unknown) {
      window.alert(getErrorMessage(cancelError, "Failed to cancel order"));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SkeletonBlock className="mb-8 h-10 w-1/4" />
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <SkeletonRow key={index} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={XCircle}
        title="We could not load your orders"
        description="Something went wrong while fetching your order history."
        actionLabel="Try again"
        onActionClick={() => window.location.reload()}
      />
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No orders yet"
        description="Once you place an order it will show up here with its status."
        actionLabel="Explore the collection"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Orders" }]} />

      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Your orders
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Everything you&rsquo;ve ordered, with live status.
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order: Order) => (
          <div
            key={order.id}
            className="overflow-hidden rounded-2xl border border-line bg-surface"
          >
            <div className="flex flex-col gap-4 border-b border-line bg-surface-muted px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-subtle">
                    Order
                  </p>
                  <p
                    className="truncate text-xs tabular-nums text-ink-muted"
                    title={order.id}
                  >
                    {order.id.slice(0, 8)}…
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-subtle">
                    Placed
                  </p>
                  <p className="text-xs font-medium text-ink-muted">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-subtle">
                    Total
                  </p>
                  <p className="text-sm font-semibold text-ink">
                    $
                    {order.total_price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-subtle">
                    Ship to
                  </p>
                  <p
                    className="max-w-40 truncate text-xs text-ink-muted"
                    title={order.shipping_address}
                  >
                    {order.shipping_address}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <OrderStatusBadge status={order.status} />
                {(order.status.toLowerCase() === "pending" ||
                  order.status.toLowerCase() === "processing") && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="cursor-pointer text-xs font-medium text-ink-muted transition-colors hover:text-danger"
                  >
                    Cancel
                  </button>
                )}
                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent-strong"
                >
                  View details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-line px-6">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="text-lg font-semibold text-ink">
                      {item.product_name}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      Qty {item.quantity} · ${item.product_price.toFixed(2)} each
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
