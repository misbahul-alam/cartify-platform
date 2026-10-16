"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Info,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import {
  Breadcrumb,
  EmptyState,
  SkeletonBlock,
  SkeletonRow,
} from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800";

const formatPrice = (value: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: 2 });

export const CartContainer: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const totalItems = useCartStore((state) => state.totalItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const loading = useCartStore((state) => state.loading);

  const shippingCost = totalPrice >= 100 || totalPrice === 0 ? 0 : 9.99;
  const finalTotal = totalPrice + shippingCost;

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SkeletonBlock className="mb-8 h-10 w-1/4" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonRow key={index} />
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
        title="Your cart is empty"
        description="Items you add will gather here, ready for a quick checkout."
        actionLabel="Explore the collection"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
            Your cart
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {totalItems} item{totalItems === 1 ? "" : "s"} ready to check out.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="cursor-pointer text-sm font-medium text-ink-muted transition-colors hover:text-danger"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4"
            >
              <Link
                href={`/products/${item.product.slug}`}
                className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-muted"
              >
                <Image
                  src={item.product.images?.[0]?.url || FALLBACK_IMAGE}
                  alt={item.product.name}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.product.slug}`}>
                  <h3 className="truncate font-display text-lg font-semibold text-ink transition-colors hover:text-accent">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="mt-0.5 text-xs capitalize text-ink-subtle">
                  {item.product.category?.name || "Product"}
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  ${formatPrice(item.product.price)}
                </p>
              </div>

              <div className="flex items-center rounded-full border border-line p-0.5">
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity - 1)
                  }
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-ink">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity + 1)
                  }
                  aria-label="Increase quantity"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="hidden w-20 text-right sm:block">
                <p className="text-sm font-semibold text-ink">
                  ${formatPrice(item.subtotal)}
                </p>
              </div>

              <button
                onClick={() => removeItem(item.product.id)}
                aria-label="Remove item"
                className="cursor-pointer p-2 text-ink-subtle transition-colors hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4 lg:sticky lg:top-32">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl font-semibold text-ink">
              Order summary
            </h2>

            <div className="mt-5 space-y-3.5">
              <div className="flex items-center justify-between text-sm text-ink-muted">
                <span>Subtotal</span>
                <span className="font-medium text-ink">
                  ${formatPrice(totalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-ink-muted">
                <span>Shipping</span>
                {shippingCost === 0 ? (
                  <span className="text-xs font-semibold uppercase tracking-wide text-success">
                    Free
                  </span>
                ) : (
                  <span className="font-medium text-ink">
                    ${formatPrice(shippingCost)}
                  </span>
                )}
              </div>

              {shippingCost > 0 && (
                <div className="flex items-start gap-2.5 rounded-xl bg-accent-soft p-3.5 text-xs leading-5 text-accent-strong">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Add{" "}
                    <span className="font-semibold">
                      ${(100 - totalPrice).toFixed(2)}
                    </span>{" "}
                    more for free shipping.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-line pt-4">
                <span className="text-sm font-semibold text-ink">Total</span>
                <span className="font-display text-2xl font-semibold text-ink">
                  ${formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            <div className="mt-7">
              {user ? (
                <Link
                  href="/checkout"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-strong"
                >
                  Proceed to checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/signin?redirect=/checkout"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-strong"
                  >
                    Sign in to checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-center text-xs text-ink-subtle">
                    Signing in keeps your order attached to your account.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-xs leading-5 text-ink-muted">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <span>
              Payments are processed over an encrypted connection with Stripe.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartContainer;
