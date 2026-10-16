"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoriesStore } from "@/store/useCategoriesStore";

export const Header: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const totalItems = useCartStore((state) => state.totalItems);
  const categories = useCategoriesStore((state) => state.categories);
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, [categories.length, fetchCategories]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { title: "All products", href: "/products" },
    ...categories
      .filter((category) => category.status === "public")
      .slice(0, 5)
      .map((category) => ({
        title: category.name,
        href: `/products?category=${category.slug}`,
      })),
  ];

  const initials = user?.data
    ? `${user.data.first_name?.[0] ?? ""}${user.data.last_name?.[0] ?? ""}`.toUpperCase() ||
      user.data.email[0].toUpperCase()
    : "";

  return (
    <div className="sticky top-0 z-50">
      <div className="bg-ink py-2 text-center text-[11px] tracking-wide text-canvas/80">
        Free shipping on orders over $100 · Complimentary returns within 30 days
      </div>

      <header className="border-b border-line bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold leading-none tracking-[-0.03em] text-ink">
                Cartify
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-ink-muted transition-colors hover:text-accent"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((open) => !open)}
                  className="flex cursor-pointer items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-surface-muted"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-strong">
                    {initials}
                  </span>
                  <ChevronDown className="h-4 w-4 text-ink-subtle" />
                </button>

                {accountOpen && (
                  <div className="animate-rise absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl shadow-black/5">
                    <div className="border-b border-line px-3 py-2.5">
                      <p className="truncate text-sm font-medium text-ink">
                        {user.data.first_name} {user.data.last_name}
                      </p>
                      <p className="truncate text-xs text-ink-subtle">
                        {user.data.email}
                      </p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                    >
                      <Package className="h-4 w-4" />
                      Orders
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                    >
                      <UserRound className="h-4 w-4" />
                      Account
                    </Link>
                    {(user.data.role === "admin" ||
                      user.data.role === "seller") && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {user.data.role === "admin"
                          ? "Admin panel"
                          : "Seller panel"}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        logout();
                      }}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-soft"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="ml-1 hidden h-10 items-center rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-strong sm:inline-flex"
              >
                Sign in
              </Link>
            )}

            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Menu"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink lg:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line bg-canvas lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  {link.title}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-medium text-white"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;
