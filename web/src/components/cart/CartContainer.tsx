"use client";

import React from "react";
import Link from "next/link";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Info,
  ShieldCheck,
} from "lucide-react";
import {
  Breadcrumb,
  EmptyState,
  SkeletonBlock,
  SkeletonRow,
} from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

export const CartContainer: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const {
    items,
    totalPrice,
    totalItems,
    updateQuantity,
    removeItem,
    clearCart,
    loading,
  } = useCartStore();

  const shippingCost = totalPrice >= 100 || totalPrice === 0 ? 0 : 9.99;
  const finalTotal = totalPrice + shippingCost;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
        <SkeletonBlock className="h-10 w-1/4 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
          <SkeletonRow className="h-64" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your shopping cart is empty"
        description="Looks like you haven't added anything to your cart yet."
        actionLabel="Explore Catalog"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Shopping Cart" }]}
      />

      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Shopping Cart ({totalItems})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-650 hover:text-red-500 transition-colors cursor-pointer"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs"
            >
              <div className="h-20 w-20 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                <img
                  src={
                    item.product.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600"
                  }
                  alt={item.product.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.slug}`} className="block">
                  <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-xs text-zinc-405 capitalize mt-0.5">
                  {item.product.category?.name || "Product"}
                </p>
                <p className="text-xs text-zinc-950 dark:text-zinc-50 font-bold mt-1">
                  $
                  {item.product.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-950">
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity - 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 transition-colors cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-zinc-900 dark:text-zinc-50">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity + 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="text-right min-w-[70px]">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  $
                  {item.subtotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <button
                onClick={() => removeItem(item.product.id)}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="border border-zinc-200/80 rounded-2xl bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-bold text-zinc-950 dark:text-zinc-50">
                  $
                  {totalPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Shipping</span>
                {shippingCost === 0 ? (
                  <span className="font-bold text-green-650 dark:text-green-400 uppercase text-[9px] tracking-wider">
                    Free
                  </span>
                ) : (
                  <span className="font-bold text-zinc-950 dark:text-zinc-50">
                    $
                    {shippingCost.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                )}
              </div>

              {shippingCost > 0 && (
                <div className="flex items-start gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 text-[10px] text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-950/30 dark:text-indigo-400">
                  <Info className="h-4.5 w-4.5 shrink-0 text-indigo-550" />
                  <span>
                    Add{" "}
                    <span className="font-bold">
                      ${(100 - totalPrice).toFixed(2)}
                    </span>{" "}
                    more to qualify for Free Shipping!
                  </span>
                </div>
              )}

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                  Total Amount
                </span>
                <span className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50">
                  $
                  {finalTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="mt-8">
              {user ? (
                <Link
                  href="/checkout"
                  className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold shadow transition-premium hover:bg-indigo-500 cursor-pointer"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/signin?redirect=/checkout"
                    className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold shadow transition-premium hover:bg-indigo-500 cursor-pointer"
                  >
                    Login to Checkout
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                  <p className="text-center text-[10px] text-zinc-400">
                    Signing in lets you complete your purchase safely.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200/55 text-xs text-zinc-500 dark:border-zinc-800/55 dark:text-zinc-400">
            <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
            <span>
              We secure your transactions with industry-standard SSL encryption
              and Stripe integration.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartContainer;
