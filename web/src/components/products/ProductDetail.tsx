"use client";

import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  EmptyState,
  SkeletonBlock,
  SkeletonSquare,
} from "@/components/ui";
import {
  Check,
  Info,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useProductsStore } from "@/store/useProductsStore";

type Props = {
  slug: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800";

export const ProductDetail: React.FC<Props> = ({ slug }) => {
  const addItem = useCartStore((state) => state.addItem);
  const selectedProduct = useProductsStore((state) => state.selectedProduct);
  const loading = useProductsStore((state) => state.loading);
  const fetchProductBySlug = useProductsStore(
    (state) => state.fetchProductBySlug,
  );

  const product = selectedProduct;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProductBySlug(slug).then(() => {
      const loaded = useProductsStore.getState().selectedProduct;
      if (loaded?.images?.length) setActiveImage(loaded.images[0].url);
    });
  }, [slug, fetchProductBySlug]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <SkeletonSquare />
          <div className="space-y-5">
            <SkeletonBlock className="h-4 w-1/4" />
            <SkeletonBlock className="h-12 w-3/4" />
            <SkeletonBlock className="h-8 w-1/3" />
            <SkeletonBlock className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <EmptyState
        icon={Info}
        title="Product not found"
        description="This product may have been removed or renamed."
        actionLabel="Return to catalog"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Catalog", href: "/products" },
          ...(product.category
            ? [
                {
                  label: product.category.name,
                  href: `/products?category=${product.category.slug}`,
                },
              ]
            : []),
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-[2rem] border border-line bg-surface-muted">
            <img
              src={activeImage || FALLBACK_IMAGE}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>

          {product.images?.length > 1 && (
            <div className="flex flex-wrap items-center gap-3">
              {product.images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setActiveImage(image.url)}
                  className={`relative aspect-square w-20 cursor-pointer overflow-hidden rounded-xl border bg-surface transition-colors ${
                    activeImage === image.url
                      ? "border-accent ring-2 ring-accent/20"
                      : "border-line hover:border-line-strong"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-7">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                {product.category?.name || "Product"}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                  product.is_stock
                    ? "bg-success-soft text-success"
                    : "bg-danger-soft text-danger"
                }`}
              >
                {product.is_stock ? "In stock" : "Out of stock"}
              </span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 font-mono text-xs text-ink-subtle">
              SKU {product.sku}
            </p>
          </div>

          <div className="border-y border-line py-6">
            <span className="font-display text-4xl font-semibold text-ink">
              $
              {product.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink">Description</h2>
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              {product.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Truck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">Free delivery</p>
                <p className="text-xs text-ink-muted">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">Secure checkout</p>
                <p className="text-xs text-ink-muted">Stripe encrypted</p>
              </div>
            </div>
          </div>

          {product.is_stock && (
            <div className="flex flex-col items-stretch gap-3 pt-1 sm:flex-row sm:items-center">
              <div className="flex items-center justify-between rounded-full border border-line bg-surface p-1 sm:justify-start">
                <button
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold text-ink">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((value) => value + 1)}
                  aria-label="Increase quantity"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={added}
                className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:bg-success disabled:opacity-100"
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Add to cart
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
