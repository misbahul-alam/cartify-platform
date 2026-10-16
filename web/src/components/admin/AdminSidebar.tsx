"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminStore } from "@/store/useAdminStore";
import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";

export type StaffRole = "admin" | "seller";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: StaffRole[];
  badge?: "openOrders";
};

export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export const adminNav: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        roles: ["admin", "seller"],
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: Package,
        roles: ["admin"],
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Tags,
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: ReceiptText,
        roles: ["admin", "seller"],
        badge: "openOrders",
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
        roles: ["admin"],
      },
    ],
  },
];

export const adminNavItems: AdminNavItem[] = adminNav.flatMap(
  (group) => group.items,
);

export const AdminSidebar: React.FC<{
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}> = ({ collapsed = false, onNavigate, onToggleCollapse }) => {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const orders = useAdminStore((state) => state.orders);
  const profile = user?.data;
  const role = profile?.role as StaffRole | undefined;

  const openOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "processing" ||
      order.status === "paid",
  ).length;

  const badges: Record<string, number> = { openOrders };

  return (
    <div className="relative flex h-full flex-col">
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2 border-b border-line px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2"
        >
          <span className="text-lg font-semibold tracking-[-0.03em] text-ink">
            {collapsed ? "C" : "Cartify"}
          </span>
          {!collapsed && (
            <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-canvas">
              Admin
            </span>
          )}
        </Link>

        {onToggleCollapse && !collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="ml-auto hidden h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink lg:flex"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}

        {onToggleCollapse && collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="absolute left-1/2 top-16 hidden h-8 w-8 -translate-x-1/2 cursor-pointer items-center justify-center rounded-lg text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink lg:flex"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {adminNav.map((group) => {
          const items = group.items.filter(
            (item) => role !== undefined && item.roles.includes(role),
          );
          if (items.length === 0) return null;

          return (
            <div key={group.label} className="mb-5 last:mb-0">
              {!collapsed && (
                <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-subtle/80">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map(({ label, href, icon: Icon, badge }) => {
                  const active =
                    href === "/admin"
                      ? pathname === href
                      : pathname.startsWith(href);
                  const count = badge ? badges[badge] : 0;

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavigate}
                      title={collapsed ? label : undefined}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors",
                        collapsed ? "justify-center px-0" : "px-3",
                        active
                          ? "bg-accent-soft text-accent-strong"
                          : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                      )}
                    >
                      {active && !collapsed && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
                      )}
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{label}</span>}
                      {!collapsed && count > 0 && (
                        <span className="ml-auto rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-ink-muted">
                          {count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        {profile && !collapsed && (
          <div className="mb-2 flex items-center gap-3 rounded-xl px-1 py-1.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
              {getInitials(profile.first_name, profile.last_name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="truncate text-xs text-ink-subtle">{profile.email}</p>
            </div>
          </div>
        )}

        <Link
          href="/"
          onClick={onNavigate}
          title={collapsed ? "View store" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink",
            collapsed ? "justify-center px-0" : "px-3",
          )}
        >
          <ArrowUpRight className="h-4 w-4 shrink-0" />
          {!collapsed && "View store"}
        </Link>

        <button
          type="button"
          title={collapsed ? "Sign out" : undefined}
          onClick={() => {
            onNavigate?.();
            logout();
            router.push("/");
          }}
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 rounded-xl py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-soft",
            collapsed ? "justify-center px-0" : "px-3",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
