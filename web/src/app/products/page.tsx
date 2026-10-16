"use client";

import { Suspense } from "react";
import { Breadcrumb, SkeletonBlock, SkeletonCard } from "@/components/ui";
import { ProductCatalog } from "@/components/products";

export default function ProductsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Catalog" }]}
        className="mb-6"
      />

      <div className="mb-10 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          The collection
        </span>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Everything we carry
        </h1>
        <p className="mt-4 text-sm leading-6 text-ink-muted">
          Filter by category, search by name, and sort by what matters — then
          check out in under a minute.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col gap-8 lg:flex-row">
            <SkeletonBlock className="h-96 rounded-2xl lg:w-72" />
            <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
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
