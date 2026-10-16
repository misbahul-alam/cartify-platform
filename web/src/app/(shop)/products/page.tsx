"use client";

import { Suspense } from "react";
import { Breadcrumb, SkeletonBlock, SkeletonCard } from "@/components/ui";
import { ProductCatalog } from "@/components/products";
import { useProductsStore } from "@/store/useProductsStore";
import { useCategoriesStore } from "@/store/useCategoriesStore";

export default function ProductsPage() {
  const productCount = useProductsStore((state) => state.products.length);
  const productsLoading = useProductsStore((state) => state.loading);
  const categoryCount = useCategoriesStore(
    (state) =>
      state.categories.filter((category) => category.status === "public")
        .length,
  );
  const categoriesLoading = useCategoriesStore((state) => state.loading);

  const displayCount = (value: number, busy: boolean) =>
    busy && value === 0 ? "—" : value;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Catalog" }]}
        className="mb-8"
      />

      <div className="grid gap-10 border-b border-line pb-12 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            The collection
          </span>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Everything we carry
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-ink-muted">
            Filter by category, search by name, and sort by what matters —
            considered goods, ready to ship within 24 hours.
          </p>
        </div>

        <dl className="flex flex-wrap items-center gap-x-12 gap-y-6 lg:col-span-5 lg:justify-self-end">
          <div>
            <dt className="text-xs uppercase tracking-widest text-ink-subtle">
              Pieces
            </dt>
            <dd className="mt-1.5 text-3xl font-semibold text-ink">
              {displayCount(productCount, productsLoading)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-ink-subtle">
              Departments
            </dt>
            <dd className="mt-1.5 text-3xl font-semibold text-ink">
              {displayCount(categoryCount, categoriesLoading)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-ink-subtle">
              Dispatch
            </dt>
            <dd className="mt-1.5 text-3xl font-semibold text-ink">
              24h
            </dd>
          </div>
        </dl>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col gap-8 pt-10 lg:flex-row lg:gap-12">
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
