"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  DollarSign,
  Package,
  Plus,
  ReceiptText,
  Tags,
  TriangleAlert,
  Users,
} from "lucide-react";
import {
  AdminPageHeader,
  Pill,
  RevenueTrend,
  StatCard,
  StatusBreakdown,
  TopProducts,
  orderStatusTone,
} from "@/components/admin";
import { useProductsStore } from "@/store/useProductsStore";
import { useCategoriesStore } from "@/store/useCategoriesStore";
import { useAdminStore } from "@/store/useAdminStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatPrice, formatRelative, shortId } from "@/lib/format";

const dayMs = 86_400_000;

export default function AdminDashboardPage() {
  const role = useAuthStore((state) => state.user?.data?.role);
  const isAdmin = role === "admin";

  const products = useProductsStore((state) => state.products);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const categories = useCategoriesStore((state) => state.categories);
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);
  const users = useAdminStore((state) => state.users);
  const orders = useAdminStore((state) => state.orders);
  const fetchUsers = useAdminStore((state) => state.fetchUsers);
  const fetchAllOrders = useAdminStore((state) => state.fetchAllOrders);

  useEffect(() => {
    fetchProducts(1, 100);
    fetchCategories();
    fetchAllOrders();
    if (isAdmin) fetchUsers();
  }, [isAdmin, fetchProducts, fetchCategories, fetchAllOrders, fetchUsers]);

  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = today.getTime();
    const revenue = new Array(28).fill(0) as number[];
    const counts = new Array(28).fill(0) as number[];

    for (const order of orders) {
      const placed = new Date(order.created_at);
      placed.setHours(0, 0, 0, 0);
      const days = Math.floor((now - placed.getTime()) / dayMs);
      if (days < 0 || days > 27) continue;
      const position = 27 - days;
      revenue[position] += order.total_price;
      counts[position] += 1;
    }

    const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
    const trend = (current: number, prior: number) =>
      prior === 0 ? (current > 0 ? 100 : 0) : ((current - prior) / prior) * 100;

    const recentRevenue = revenue.slice(14);
    const recentCounts = counts.slice(14);
    const revenueNow = sum(recentRevenue);
    const revenueBefore = sum(revenue.slice(0, 14));
    const ordersNow = sum(recentCounts);
    const ordersBefore = sum(counts.slice(0, 14));
    const aovNow = ordersNow === 0 ? 0 : revenueNow / ordersNow;
    const aovBefore = ordersBefore === 0 ? 0 : revenueBefore / ordersBefore;

    return {
      revenueNow,
      revenueTrend: trend(revenueNow, revenueBefore),
      revenueSpark: recentRevenue,
      ordersNow,
      ordersTrend: trend(ordersNow, ordersBefore),
      ordersSpark: recentCounts,
      aovNow,
      aovTrend: trend(aovNow, aovBefore),
    };
  }, [orders]);

  const openOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "processing" ||
      order.status === "paid",
  ).length;
  const outOfStock = products.filter((product) => !product.is_stock);
  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 6),
    [orders],
  );

  const quickActions = isAdmin
    ? [
        {
          label: "Add a product",
          description: "Publish something new to the catalog",
          href: "/admin/products/new",
        },
        {
          label: "Organise categories",
          description: "Group products into departments",
          href: "/admin/categories",
        },
        {
          label: "Review users",
          description: "Accounts, roles and lifetime spend",
          href: "/admin/users",
        },
      ]
    : [
        {
          label: "Review orders",
          description: "Move orders through fulfilment",
          href: "/admin/orders",
        },
        {
          label: "View storefront",
          description: "See what shoppers see",
          href: "/",
        },
      ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="A snapshot of the store — revenue, fulfilment and catalog health at a glance."
        actions={
          isAdmin && (
            <Link
              href="/admin/products/new"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              <Plus className="h-4 w-4" />
              New product
            </Link>
          )
        }
      />

      <div
        className={`grid gap-4 ${
          isAdmin
            ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            : "sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        <StatCard
          label="Revenue"
          value={formatPrice(metrics.revenueNow)}
          icon={DollarSign}
          trend={metrics.revenueTrend}
          trendLabel="vs previous 14 days"
          sparkline={metrics.revenueSpark}
        />
        <StatCard
          label="Orders"
          value={metrics.ordersNow}
          icon={ReceiptText}
          trend={metrics.ordersTrend}
          trendLabel="vs previous 14 days"
          sparkline={metrics.ordersSpark}
        />
        <StatCard
          label="Avg order value"
          value={formatPrice(metrics.aovNow)}
          icon={ReceiptText}
          trend={metrics.aovTrend}
          trendLabel="vs previous 14 days"
        />
        <StatCard
          label="Products"
          value={products.length}
          hint={`${outOfStock.length} out of stock`}
          icon={Package}
        />
        {isAdmin ? (
          <StatCard
            label="Users"
            value={users.length}
            hint={`${categories.length} categories`}
            icon={Users}
          />
        ) : (
          <StatCard
            label="Open orders"
            value={openOrders}
            hint="Pending, processing or paid"
            icon={Tags}
          />
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <RevenueTrend orders={orders} />
        </div>
        <StatusBreakdown orders={orders} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <TopProducts orders={orders} />
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
              <TriangleAlert className="h-4 w-4 text-warning" />
              Out of stock
            </h2>
            <span className="text-xs text-ink-subtle tabular-nums">
              {outOfStock.length} of {products.length}
            </span>
          </div>

          {outOfStock.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">
              Everything in the catalog is available.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {outOfStock.slice(0, 6).map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="truncate text-sm text-ink">
                    {product.name}
                  </span>
                  {isAdmin && (
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="shrink-0 text-xs font-medium text-accent transition-colors hover:text-accent-strong"
                    >
                      Restock
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-lg font-semibold text-ink">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-strong"
            >
              All orders
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="px-6 py-14 text-center text-sm text-ink-muted">
              No orders have been placed yet.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-surface-muted"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-ink tabular-nums">
                        #{shortId(order.id)}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-subtle">
                        {order.items?.length ?? 0} items ·{" "}
                        {formatRelative(order.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="text-sm font-medium text-ink tabular-nums">
                        {formatPrice(order.total_price)}
                      </span>
                      <Pill tone={orderStatusTone[order.status] || "neutral"}>
                        {order.status}
                      </Pill>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold text-ink">Quick actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 transition-colors hover:border-line-strong hover:bg-surface-muted"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">
                    {action.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink-subtle">
                    {action.description}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
