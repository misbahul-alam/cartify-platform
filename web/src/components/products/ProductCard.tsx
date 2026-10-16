"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { Check, Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

type Props = {
  product: Product;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800";

export const ProductCard: React.FC<Props> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleQuickAdd = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!product.is_stock) return;

    await addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const image = product.images?.[0]?.url || FALLBACK_IMAGE;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
      <div className="relative aspect-square w-full overflow-hidden bg-surface-muted">
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 block"
        >
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.05]"
          />
        </Link>

        <div className="absolute left-4 top-4 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="rounded-full bg-canvas/90 px-3 py-1 text-[11px] font-medium text-ink backdrop-blur">
              Featured
            </span>
          )}
          {!product.is_stock && (
            <span className="rounded-full bg-danger px-3 py-1 text-[11px] font-medium text-white">
              Sold out
            </span>
          )}
        </div>

        {product.is_stock && (
          <button
            onClick={handleQuickAdd}
            disabled={added}
            aria-label="Add to cart"
            className={`absolute bottom-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border shadow-lg shadow-black/5 backdrop-blur transition-colors ${
              added
                ? "border-accent bg-accent text-white"
                : "border-line bg-canvas/90 text-ink hover:bg-canvas"
            }`}
          >
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] uppercase tracking-widest text-ink-subtle">
          {product.category?.name || "Product"}
        </p>
        <Link href={`/products/${product.slug}`} className="mt-2">
          <h3 className="font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-5 text-ink-muted">
          {product.description}
        </p>
        <p className="mt-4 text-sm font-semibold text-ink">
          $
          {product.price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
    </article>
  );
};

export default ProductCard;
