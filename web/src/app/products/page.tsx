"use client";

import { Suspense } from "react";
import { Breadcrumb, SkeletonBlock, SkeletonCard } from "@/components/ui";
import { ProductCatalog } from "@/components/products";

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Catalog" }]}
        className="mb-6"
      />

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Explore Our Catalog
        </h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
          Browse through premium items curated across our collection
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <SkeletonBlock className="h-64 rounded-2xl" />
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        }
      >
        <ProductCatalog />
      </Suspense>
    </div>
  );
}
