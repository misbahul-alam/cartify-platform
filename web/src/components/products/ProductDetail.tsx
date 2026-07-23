"use client";

import React, { useEffect, useState } from "react";

import {
  Breadcrumb,
  EmptyState,
  SkeletonSquare,
  SkeletonBlock,
} from "@/components/ui";
import {
  ShoppingCart,
  Check,
  Minus,
  Plus,
  Info,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useProductsStore } from "@/store/useProductsStore";

type Props = {
  slug: string;
};

export const ProductDetail: React.FC<Props> = ({ slug }) => {
  const { addItem } = useCartStore();
  const { selectedProduct, loading, fetchProductBySlug } = useProductsStore();

  const product = selectedProduct;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug)
        .then(() => {
          const p = useProductsStore.getState().selectedProduct;
          if (p && p.images?.length > 0) {
            setActiveImage(p.images[0].url);
          }
        })
        .catch((err: any) => {
          console.error("Failed to load product details:", err);
        });
    }
  }, [slug]);

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addItem(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <SkeletonSquare />
          <div className="space-y-4">
            <SkeletonBlock className="h-6 w-1/4" />
            <SkeletonBlock className="h-10 w-3/4" />
            <SkeletonBlock className="h-6 w-1/3" />
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
        description="The product you are looking for might have been removed or renamed."
        actionLabel="Return to Catalog"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl border border-zinc-200/80 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <img
              src={
                activeImage ||
                "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600"
              }
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>

          {product.images?.length > 1 && (
            <div className="flex items-center gap-3">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative aspect-square w-20 rounded-xl border overflow-hidden bg-white dark:bg-zinc-900 cursor-pointer transition-premium ${
                    activeImage === img.url
                      ? "border-indigo-500 ring-2 ring-indigo-500/30"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <img
                    src={img.url}
                    alt="Thumbnail"
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {product.category?.name || "Product"}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  product.is_stock
                    ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                }`}
              >
                {product.is_stock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mt-2 leading-[1.15]">
              {product.name}
            </h1>
            <p className="text-sm font-mono text-zinc-400 dark:text-zinc-550 mt-2">
              SKU: {product.sku}
            </p>
          </div>

          <div className="border-y border-zinc-200/80 py-4 dark:border-zinc-800">
            <span className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50">
              $
              {product.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-sm leading-6 text-zinc-650 dark:text-zinc-350">
              {product.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200/50 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
              <Truck className="h-5 w-5 text-indigo-655 shrink-0" />
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                  Free Delivery
                </p>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-500">
                  For orders above $100
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200/50 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
              <ShieldCheck className="h-5 w-5 text-indigo-655 shrink-0" />
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                  Secure Checkout
                </p>
                <p className="text-[10px] text-zinc-455 dark:text-zinc-500">
                  Stripe encrypted payment
                </p>
              </div>
            </div>
          </div>

          {product.is_stock && (
            <div className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 transition-colors cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={added}
                  className="flex-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold shadow transition-premium hover:bg-indigo-500 active:scale-[0.98] disabled:bg-green-600 cursor-pointer"
                >
                  {added ? (
                    <>
                      <Check className="h-5 w-5" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
