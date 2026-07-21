"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  XCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Truck,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { useOrdersStore } from "../store";
import {
  Breadcrumb,
  EmptyState,
  SkeletonBlock,
  SkeletonRow,
} from "@/shared/ui";
import type { Order } from "@/types";

export const OrderHistory: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const { orders, loading, error, fetchOrders, cancelOrder } = useOrdersStore();

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/orders");
      return;
    }

    async function loadOrders() {
      await fetchOrders(1, 50);
    }

    loadOrders();
  }, [user]);

  const handleCancelOrder = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await cancelOrder(id);
    } catch (err: any) {
      alert(err?.message || "Failed to cancel order");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const uppercaseStatus = status.toLowerCase();
    switch (uppercaseStatus) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 dark:bg-green-950/20 dark:text-green-400 uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Delivered
          </span>
        );
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Paid
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-950/20 dark:text-red-400 uppercase tracking-wider">
            <XCircle className="h-3.5 w-3.5" />
            Cancelled
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" />
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 uppercase tracking-wider">
            <Truck className="h-3.5 w-3.5" />
            Shipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-50 px-2.5 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5" />
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
        <SkeletonBlock className="h-10 w-1/4 mb-8" />
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <SkeletonRow key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={XCircle}
        title={error}
        description="Something went wrong loading your orders."
        actionLabel="Retry Loading"
        onActionClick={() => window.location.reload()}
      />
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No orders found"
        description="You haven't placed any orders on this account yet."
        actionLabel="Explore Catalog"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Orders" }]} />

      <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mb-10">
        Order History
      </h1>

      <div className="space-y-8">
        {orders.map((order: Order) => (
          <div
            key={order.id}
            className="border border-zinc-200/80 rounded-2xl bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="bg-zinc-50/70 border-b border-zinc-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 dark:bg-zinc-900/50 dark:border-zinc-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-1">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Order ID
                  </p>
                  <p
                    className="text-xs font-mono text-zinc-700 dark:text-zinc-300 select-all truncate max-w-[120px]"
                    title={order.id}
                  >
                    {order.id.slice(0, 8)}...
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Date Placed
                  </p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Total Amount
                  </p>
                  <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                    $
                    {order.total_price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Shipping Address
                  </p>
                  <p
                    className="text-xs text-zinc-650 dark:text-zinc-350 truncate max-w-[140px]"
                    title={order.shipping_address}
                  >
                    {order.shipping_address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:self-center">
                {getStatusBadge(order.status)}

                {(order.status.toLowerCase() === "pending" ||
                  order.status.toLowerCase() === "processing") && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="text-xs font-semibold text-red-655 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 py-4 divide-y divide-zinc-100 dark:divide-zinc-800">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="py-4 flex justify-between items-center text-sm gap-4 first:pt-2 last:pb-2"
                >
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.product_name}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Quantity:{" "}
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {item.quantity}
                      </span>{" "}
                      &middot; Unit Price: ${item.product_price.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-50">
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
