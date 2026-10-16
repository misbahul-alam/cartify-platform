"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import { useCategoriesStore } from "@/store/useCategoriesStore";
import { useProductsStore } from "@/store/useProductsStore";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800";

export const CategorySlider: React.FC = () => {
  const categories = useCategoriesStore((state) => state.categories);
  const loading = useCategoriesStore((state) => state.loading);
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);
  const products = useProductsStore((state) => state.products);

  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, [categories.length, fetchCategories]);

  const publicCategories = (categories || []).filter(
    (category) => category.status === "public",
  );

  if (loading && publicCategories.length === 0) {
    return (
      <div className="-mx-4 flex gap-5 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-64 shrink-0">
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-surface-muted" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (publicCategories.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
        <Compass className="h-6 w-6 text-ink-subtle" />
        <p className="mt-3 text-sm text-ink-muted">
          Categories are being catalogued. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      {publicCategories.map((category) => {
        const count = products.filter(
          (product) => product.category?.slug === category.slug,
        ).length;

        return (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group w-64 shrink-0 snap-start"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-surface-muted">
              <Image
                src={category.image_url || FALLBACK_IMAGE}
                alt={category.name}
                fill
                sizes="256px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full bg-canvas/90 px-3 py-1 text-[11px] font-medium text-ink backdrop-blur">
                {count} {count === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <h3 className="truncate text-lg font-semibold text-ink transition-colors group-hover:text-accent">
                {category.name}
              </h3>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-subtle transition-colors group-hover:text-accent" />
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default CategorySlider;
