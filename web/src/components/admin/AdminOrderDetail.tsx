"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  Loader2,
  MapPin,
  Receipt,
  UserRound,
} from "lucide-react";
import {
  AdminPageHeader,
  CopyButton,
  DataTable,
  Pill,
  orderStatusTone,
  type DataColumn,
} from "@/components/admin";
import { Select, SkeletonBlock } from "@/components/ui";
import { useAdminStore } from "@/store/useAdminStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, formatPrice, shortId } from "@/lib/format";
import { toast } from "@/store/useToastStore";
import { cn } from "@/lib/cn";
import type { Order, OrderItem } from "@/types";

const statuses: Order["status"][] = [
  "pending",
  "processing",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

const pipeline: Order["status"][] = [
  "pending",
  "processing",
  "paid",
  "shipped",
  "delivered",
];

export const AdminOrderDetail: React.FC<{ orderId: string }> = ({
  orderId,
}) => {
  const role = useAuthStore((state) => state.user?.data?.role);
  const users = useAdminStore((state) => state.users);
  const fetchUsers = useAdminStore((state) => state.fetchUsers);
  const updateOrderStatus = useAdminStore((state) => state.updateOrderStatus);
  const fetchOrderById = useOrdersStore((state) => state.fetchOrderById);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchOrderById(orderId)
      .then((data) => {
        if (!active) return;
        setOrder(data);
        setLoading(false);
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        setError(getErrorMessage(fetchError, "Could not load this order."));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId, fetchOrderById]);

  useEffect(() => {
    if (role === "admin" && users.length === 0) fetchUsers();
  }, [role, users.length, fetchUsers]);

  const handleStatus = async (status: Order["status"]) => {
    if (!order) return;
    setSaving(true);
    try {
      await updateOrderStatus(order.id, status);
      const refreshed = await fetchOrderById(order.id);
      setOrder(refreshed);
      toast.success(`Order #${shortId(order.id)} marked ${status}.`);
    } catch (updateError: unknown) {
      toast.error(
        getErrorMessage(updateError, "Could not update the order status."),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <SkeletonBlock className="mb-8 h-10 w-1/3" />
        <div className="grid gap-6 lg:grid-cols-3">
          <SkeletonBlock className="h-80 rounded-2xl lg:col-span-2" />
          <SkeletonBlock className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <AdminPageHeader
          title="Order"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Orders", href: "/admin/orders" },
            { label: "Not found" },
          ]}
        />
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-6 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
            Order not found
          </h2>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            {error ?? "This order does not exist."}
          </p>
        </div>
      </div>
    );
  }

  const customer = users.find((user) => user.id === order.user_id);
  const subtotal = order.total_price;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;
  const locked = order.status === "delivered" || order.status === "cancelled";
  const currentIndex = pipeline.indexOf(order.status);
  const cancelled = order.status === "cancelled";

  const itemColumns: DataColumn<OrderItem>[] = [
    {
      id: "item",
      header: "Item",
      cell: (item) => (
        <span className="font-medium text-ink">{item.product_name}</span>
      ),
    },
    {
      id: "price",
      header: "Unit price",
      align: "right",
      cellClassName: "text-ink-muted tabular-nums",
      cell: (item) => formatPrice(item.product_price),
    },
    {
      id: "quantity",
      header: "Qty",
      align: "right",
      cellClassName: "text-ink-muted tabular-nums",
      cell: (item) => item.quantity,
    },
    {
      id: "subtotal",
      header: "Subtotal",
      align: "right",
      cellClassName: "font-medium text-ink tabular-nums",
      cell: (item) => formatPrice(item.subtotal),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title={`Order #${shortId(order.id)}`}
        meta={
          <div className="flex flex-wrap items-center gap-3">
            <Pill tone={orderStatusTone[order.status] || "neutral"}>
              {order.status}
            </Pill>
            <span className="text-xs text-ink-subtle">
              Placed {formatDateTime(order.created_at)}
            </span>
            <CopyButton value={order.id} label="order id" />
          </div>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Orders", href: "/admin/orders" },
          { label: `#${shortId(order.id)}` },
        ]}
        actions={
          <div className="flex items-center gap-3">
            {saving && (
              <Loader2 className="h-4 w-4 animate-spin text-ink-subtle" />
            )}
            <Select
              aria-label="Order status"
              containerClassName="w-44"
              className="h-11 py-0"
              value={order.status}
              disabled={saving || locked}
              onChange={(event) =>
                handleStatus(event.target.value as Order["status"])
              }
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status[0].toUpperCase() + status.slice(1)}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center gap-2 border-b border-line px-6 py-4">
              <Receipt className="h-4 w-4 text-ink-subtle" />
              <h2 className="text-lg font-semibold text-ink">Items</h2>
              <span className="ml-auto text-xs text-ink-subtle">
                {order.items?.length ?? 0} line items
              </span>
            </div>

            <div className="p-4">
              <DataTable
                columns={itemColumns}
                rows={order.items ?? []}
                rowKey={(item) => item.id}
                pageSize={50}
                paginated={false}
                minWidthClassName="min-w-0"
                emptyIcon={Receipt}
                emptyTitle="No items"
                emptyDescription="This order has no line items."
              />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink">Summary</h2>
            <div className="mt-4 space-y-3.5">
              <div className="flex items-center justify-between text-sm text-ink-muted">
                <span>Items</span>
                <span className="font-medium text-ink tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-ink-muted">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-xs font-semibold uppercase tracking-wide text-success">
                    Free
                  </span>
                ) : (
                  <span className="font-medium text-ink tabular-nums">
                    {formatPrice(shipping)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-line pt-4">
                <span className="text-sm font-semibold text-ink">Total</span>
                <span className="text-2xl font-semibold text-ink tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
              <UserRound className="h-4 w-4 text-ink-subtle" />
              Customer
            </h2>
            {customer ? (
              <div className="mt-3">
                <p className="text-sm font-medium text-ink">
                  {customer.first_name} {customer.last_name}
                </p>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  {customer.email}
                </p>
              </div>
            ) : (
              <p className="mt-3 break-all text-xs tabular-nums text-ink-muted">
                {order.user_id}
              </p>
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

          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink">Fulfilment</h2>

            {cancelled ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-danger-soft px-3.5 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                <p className="text-sm text-danger">
                  This order was cancelled and can no longer change status.
                </p>
              </div>
            ) : (
              <ol className="mt-4 space-y-4">
                {pipeline.map((status, index) => {
                  const done = currentIndex > index;
                  const current = currentIndex === index;
                  return (
                    <li key={status} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                          done
                            ? "border-accent bg-accent text-white"
                            : current
                              ? "border-accent text-accent"
                              : "border-line text-ink-subtle",
                        )}
                      >
                        {done ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-sm capitalize",
                            current
                              ? "font-medium text-ink"
                              : done
                                ? "text-ink-muted"
                                : "text-ink-subtle",
                          )}
                        >
                          {status}
                        </p>
                        {current && (
                          <p className="mt-0.5 text-xs text-ink-subtle">
                            Current status
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <p className="mt-5 border-t border-line pt-4 text-xs text-ink-subtle">
              Last updated {formatDateTime(order.updated_at)}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface-muted/50 p-6">
            <p className="text-xs leading-5 text-ink-muted">
              Need to reach the customer? Ask them for the order reference{" "}
              <span className="font-medium text-ink tabular-nums">
                #{shortId(order.id)}
              </span>{" "}
              or{" "}
              <Link
                href="/admin/orders"
                className="font-medium text-accent transition-colors hover:text-accent-strong"
              >
                return to all orders
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
