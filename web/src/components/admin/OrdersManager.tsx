"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  Loader2,
  PackageCheck,
  ReceiptText,
  Truck,
  XCircle,
} from "lucide-react";
import {
  AdminPageHeader,
  CopyButton,
  DataTable,
  Pill,
  SearchInput,
  SegmentedFilter,
  Toolbar,
  ToolbarGroup,
  orderStatusTone,
  type DataColumn,
} from "@/components/admin";
import { Button, Select } from "@/components/ui";
import { useAdminStore } from "@/store/useAdminStore";
import { getErrorMessage } from "@/lib/errors";
import { downloadCsv } from "@/lib/csv";
import { formatDateTime, formatPrice, formatRelative, shortId } from "@/lib/format";
import { toast } from "@/store/useToastStore";
import { cn } from "@/lib/cn";
import type { Order } from "@/types";

const statuses: Order["status"][] = [
  "pending",
  "processing",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

const bulkButton =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:pointer-events-none disabled:opacity-50";

export const OrdersManager: React.FC = () => {
  const orders = useAdminStore((state) => state.orders);
  const loading = useAdminStore((state) => state.ordersLoading);
  const fetchAllOrders = useAdminStore((state) => state.fetchAllOrders);
  const updateOrderStatus = useAdminStore((state) => state.updateOrderStatus);

  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;
      if (!needle) return true;
      return (
        order.id.toLowerCase().includes(needle) ||
        order.user_id.toLowerCase().includes(needle)
      );
    });
  }, [orders, filter, query]);

  const handleStatus = async (order: Order, status: Order["status"]) => {
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, status);
      toast.success(`Order #${shortId(order.id)} marked ${status}.`);
    } catch (updateError: unknown) {
      toast.error(
        getErrorMessage(updateError, "Could not update the order status."),
      );
    } finally {
      setBusyId(null);
    }
  };

  const bulkStatus = async (rows: Order[], status: Order["status"]) => {
    setBulkBusy(true);
    let updated = 0;
    let failure: string | null = null;

    for (const order of rows) {
      try {
        await updateOrderStatus(order.id, status, { refresh: false });
        updated += 1;
      } catch (bulkError: unknown) {
        failure ??= getErrorMessage(bulkError, "Some orders could not be updated.");
      }
    }

    await fetchAllOrders();
    setBulkBusy(false);

    if (failure) {
      toast.error(
        `${updated} of ${rows.length} updated. ${failure}`,
      );
      return;
    }
    toast.success(
      `${updated} ${updated === 1 ? "order" : "orders"} marked ${status}.`,
    );
  };

  const handleExport = () => {
    downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Order", "Customer", "Items", "Total", "Status", "Placed", "Ship to"],
      ...filtered.map((order) => [
        order.id,
        order.user_id,
        order.items?.length ?? 0,
        order.total_price,
        order.status,
        order.created_at,
        order.shipping_address,
      ]),
    ]);
    toast.info(`Exported ${filtered.length} orders.`);
  };

  const columns: DataColumn<Order>[] = [
    {
      id: "order",
      header: "Order",
      sortValue: (order) => order.created_at,
      cell: (order) => (
        <div className="flex items-center gap-0.5">
          <Link
            href={`/admin/orders/${order.id}`}
            className="font-medium text-ink tabular-nums transition-colors hover:text-accent"
          >
            #{shortId(order.id)}
          </Link>
          <CopyButton value={order.id} label="order id" />
        </div>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cellClassName: "text-ink-muted",
      cell: (order) => (
        <div className="flex items-center gap-0.5">
          <span className="tabular-nums">{shortId(order.user_id)}</span>
          <CopyButton value={order.user_id} label="customer id" />
        </div>
      ),
    },
    {
      id: "items",
      header: "Items",
      align: "right",
      sortValue: (order) => order.items?.length ?? 0,
      cellClassName: "text-ink-muted tabular-nums",
      cell: (order) => order.items?.length ?? 0,
    },
    {
      id: "total",
      header: "Total",
      align: "right",
      sortValue: (order) => order.total_price,
      cellClassName: "font-medium text-ink tabular-nums",
      cell: (order) => formatPrice(order.total_price),
    },
    {
      id: "placed",
      header: "Placed",
      sortValue: (order) => new Date(order.created_at).getTime(),
      cellClassName: "text-ink-muted",
      cell: (order) => (
        <span title={formatDateTime(order.created_at)} className="whitespace-nowrap">
          {formatRelative(order.created_at)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (order) => order.status,
      cell: (order) => {
        const locked =
          order.status === "delivered" || order.status === "cancelled";
        const busy = busyId === order.id;

        if (locked) {
          return (
            <Pill tone={orderStatusTone[order.status] || "neutral"}>
              {order.status}
            </Pill>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Select
              aria-label={`Status for order ${shortId(order.id)}`}
              containerClassName="w-36"
              className="h-9 py-0 text-xs"
              value={order.status}
              disabled={busy}
              onChange={(event) =>
                handleStatus(order, event.target.value as Order["status"])
              }
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status[0].toUpperCase() + status.slice(1)}
                </option>
              ))}
            </Select>
            {busy && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-subtle" />
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (order) => (
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent-strong"
        >
          Details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];

  const filters: (Order["status"] | "all")[] = ["all", ...statuses];

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Every order placed across the store. Move each one through the fulfilment pipeline."
        actions={
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      <Toolbar className="mb-4">
        <ToolbarGroup>
          <SegmentedFilter
            value={filter}
            onChange={setFilter}
            options={filters.map((value) => ({
              value,
              label: value === "all" ? "All" : value,
              count:
                value === "all"
                  ? orders.length
                  : orders.filter((order) => order.status === value).length,
            }))}
          />
        </ToolbarGroup>

        <ToolbarGroup className="w-full sm:w-auto">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search order or customer id"
            containerClassName="w-full sm:w-72"
          />
        </ToolbarGroup>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(order) => order.id}
        loading={loading}
        pageSize={10}
        selectable
        defaultSort={{ id: "order", direction: "desc" }}
        minWidthClassName="min-w-[1040px]"
        emptyIcon={ReceiptText}
        emptyTitle="No orders here"
        emptyDescription="There are no orders matching this filter yet."
        bulkActions={(rows) => (
          <>
            <button
              type="button"
              className={bulkButton}
              disabled={bulkBusy}
              onClick={() => bulkStatus(rows, "processing")}
            >
              <PackageCheck className="h-3.5 w-3.5" />
              Processing
            </button>
            <button
              type="button"
              className={bulkButton}
              disabled={bulkBusy}
              onClick={() => bulkStatus(rows, "shipped")}
            >
              <Truck className="h-3.5 w-3.5" />
              Shipped
            </button>
            <button
              type="button"
              className={cn(bulkButton, "text-danger hover:bg-danger-soft")}
              disabled={bulkBusy}
              onClick={() => bulkStatus(rows, "cancelled")}
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel
            </button>
          </>
        )}
      />
    </div>
  );
};

export default OrdersManager;
