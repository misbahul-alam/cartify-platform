"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  CornerDownLeft,
  Package,
  Plus,
  ReceiptText,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import { adminNavItems } from "./AdminSidebar";
import { useAdminUiStore } from "@/store/useAdminUiStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminStore } from "@/store/useAdminStore";
import { useProductsStore } from "@/store/useProductsStore";
import { useMounted } from "@/lib/useMounted";
import { formatPrice, shortId } from "@/lib/format";
import { cn } from "@/lib/cn";

type PaletteItem = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  href: string;
};

export const CommandPalette: React.FC = () => {
  const router = useRouter();
  const mounted = useMounted();
  const open = useAdminUiStore((state) => state.commandOpen);
  const setOpen = useAdminUiStore((state) => state.setCommandOpen);
  const role = useAuthStore((state) => state.user?.data?.role);
  const products = useProductsStore((state) => state.products);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const orders = useAdminStore((state) => state.orders);
  const fetchAllOrders = useAdminStore((state) => state.fetchAllOrders);
  const users = useAdminStore((state) => state.users);
  const fetchUsers = useAdminStore((state) => state.fetchUsers);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const isAdmin = role === "admin";

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(!useAdminUiStore.getState().commandOpen);
        return;
      }
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    if (products.length === 0) fetchProducts(1, 100);
    if (orders.length === 0) fetchAllOrders();
    if (isAdmin && users.length === 0) fetchUsers();
  }, [
    open,
    isAdmin,
    products.length,
    orders.length,
    users.length,
    fetchProducts,
    fetchAllOrders,
    fetchUsers,
  ]);

  const items = useMemo<PaletteItem[]>(() => {
    const needle = query.trim().toLowerCase();
    const match = (...values: (string | undefined)[]) =>
      !needle || values.some((value) => value?.toLowerCase().includes(needle));

    const list: PaletteItem[] = [];

    for (const item of adminNavItems) {
      if (role && !item.roles.includes(role as "admin" | "seller")) continue;
      if (!match(item.label)) continue;
      list.push({
        id: `nav-${item.href}`,
        group: "Navigate",
        label: item.label,
        icon: item.icon,
        href: item.href,
      });
    }

    if (isAdmin) {
      const actions = [
        {
          label: "Add product",
          hint: "Create a catalog item",
          href: "/admin/products/new",
        },
        {
          label: "Add category",
          hint: "Create a department",
          href: "/admin/categories",
        },
      ].filter((action) => match(action.label, action.hint));

      for (const action of actions) {
        list.push({
          id: `act-${action.href}`,
          group: "Actions",
          label: action.label,
          hint: action.hint,
          icon: Plus,
          href: action.href,
        });
      }
    }

    for (const product of products.filter((item) =>
      match(item.name, item.sku),
    ).slice(0, 5)) {
      list.push({
        id: `product-${product.id}`,
        group: "Products",
        label: product.name,
        hint: product.sku,
        icon: Package,
        href: `/admin/products/${product.id}`,
      });
    }

    for (const order of orders.filter((item) => match(item.id)).slice(0, 5)) {
      list.push({
        id: `order-${order.id}`,
        group: "Orders",
        label: `Order #${shortId(order.id)}`,
        hint: `${formatPrice(order.total_price)} · ${order.status}`,
        icon: ReceiptText,
        href: `/admin/orders/${order.id}`,
      });
    }

    if (isAdmin) {
      for (const user of users
        .filter((item) =>
          match(`${item.first_name} ${item.last_name}`, item.email),
        )
        .slice(0, 5)) {
        list.push({
          id: `user-${user.id}`,
          group: "Users",
          label: `${user.first_name} ${user.last_name}`,
          hint: user.email,
          icon: Users,
          href: "/admin/users",
        });
      }
    }

    return list;
  }, [query, role, isAdmin, products, orders, users]);

  const activeIndex = items.length === 0 ? 0 : Math.min(active, items.length - 1);

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!mounted || !open) return null;

  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(0);
  };

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, items.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) go(item.href);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close command palette"
        onClick={close}
        className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="animate-rise relative mt-[8vh] w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/20"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-ink-subtle" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, products, orders, users…"
            className="h-13 w-full border-0 bg-transparent py-4 text-sm text-ink outline-none placeholder:text-ink-subtle"
          />
          <kbd className="hidden shrink-0 rounded-md border border-line bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-subtle sm:block">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-ink-muted">
              No results for “{query}”
            </p>
          ) : (
            items.map((item, index) => {
              const showGroup = index === 0 || items[index - 1].group !== item.group;
              const Icon = item.icon;
              return (
                <React.Fragment key={item.id}>
                  {showGroup && (
                    <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-ink-subtle">
                      {item.group}
                    </p>
                  )}
                  <button
                    type="button"
                    data-index={index}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(item.href)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      index === activeIndex
                        ? "bg-accent-soft text-accent-strong"
                        : "text-ink-muted hover:bg-surface-muted",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {item.label}
                      </span>
                      {item.hint && (
                        <span className="block truncate text-xs text-ink-subtle">
                          {item.hint}
                        </span>
                      )}
                    </span>
                    {index === activeIndex && (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    )}
                  </button>
                </React.Fragment>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[11px] text-ink-subtle">
          <span>Use ↑ ↓ to navigate, ↵ to open</span>
          <span>{items.length} results</span>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CommandPalette;
