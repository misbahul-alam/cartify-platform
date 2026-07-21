"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { ShoppingCart, Check, Star } from "lucide-react";
import { useCartStore } from "@/features/cart/store";

type Props = {
  product: Product;
};

export const ProductCard: React.FC<Props> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.is_stock) return;

    await addItem(product, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const image =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600";

  return (
    <div className="group flex flex-col rounded-2xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900 transition-premium hover:shadow-premium hover:-translate-y-0.5">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden block"
      >
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="inline-flex items-center gap-1 rounded bg-yellow-400 px-2 py-0.5 text-[9px] font-bold text-zinc-900 uppercase tracking-wider">
              <Star className="h-2.5 w-2.5 fill-current" />
              Featured
            </span>
          )}
          {!product.is_stock && (
            <span className="inline-flex items-center rounded bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            {product.category?.name || "Product"}
          </span>
          <Link href={`/products/${product.slug}`} className="block mt-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <span className="text-base font-bold text-zinc-950 dark:text-zinc-50">
            $
            {product.price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
          {product.is_stock && (
            <button
              onClick={handleQuickAdd}
              disabled={added}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-zinc-900 text-white hover:bg-indigo-600 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-indigo-500 dark:hover:text-white"
              }`}
              title="Add to Cart"
            >
              {added ? (
                <Check className="h-4.5 w-4.5" />
              ) : (
                <ShoppingCart className="h-4.5 w-4.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
