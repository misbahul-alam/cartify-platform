"use client";

import React, { useState } from "react";
import Link from "next/link";

import {
  ShoppingCart,
  User as UserIcon,
  LogOut,
  ShoppingBag,
  History,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoriesStore } from "@/store/useCategoriesStore";

export const Header: React.FC = () => {
  const { user } = useAuthStore();
  const { logout } = useAuthStore();
  const { totalItems } = useCartStore();
  const { categories } = useCategoriesStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const menuItems: { title: string; href: string }[] = [
    { title: "All Products", href: "/products" },
    ...categories.map((category) => ({
      title: category.name,
      href: `/products?category=${category.slug}`,
    })),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400"
          >
            <ShoppingBag className="h-6 w-6" />
            <span>Cartify</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative p-2 text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 transition-colors"
          >
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-full border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-all cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs font-bold uppercase">
                  {user.data.first_name?.[0] ?? "U"}
                  {user.data.last_name?.[0] ?? ""}
                </div>
                <span className="hidden sm:inline text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {user.data.first_name ?? user.data.email}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-zinc-200 bg-white p-2 shadow-lg ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-900 mb-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {user.data.first_name} {user.data.last_name}
                    </p>
                    <p className="text-xs text-zinc-500 truncate dark:text-zinc-400">
                      {user.data.email}
                    </p>
                    <span className="inline-flex mt-1 items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 capitalize">
                      {user.data.role === "admin" && (
                        <Shield className="h-3 w-3" />
                      )}
                      {user.data.role}
                    </span>
                  </div>
                  <Link
                    href="/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    <History className="h-4 w-4" />
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 transition-colors md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <nav className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 transition-colors"
              >
                {item.title}
              </Link>
            ))}

            {user && (
              <>
                <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800" />
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
                >
                  <History className="h-4 w-4" />
                  My Orders
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
