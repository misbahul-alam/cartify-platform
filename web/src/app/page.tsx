"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Truck } from "lucide-react";
import { CategorySlider, ProductCard } from "@/components/products";
import { HeroSection } from "@/components/home";
import { SkeletonCard } from "@/components/ui";
import type { Product } from "@/types";
import { useProductsStore } from "@/store/useProductsStore";
import { useCategoriesStore } from "@/store/useCategoriesStore";

const HOME_SECTION_SIZE = 8;

function ProductGrid({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: HOME_SECTION_SIZE }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center text-sm text-ink-muted">
        Products are on their way — check back shortly.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const products = useProductsStore((state) => state.products);
  const productsLoading = useProductsStore((state) => state.loading);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);

  useEffect(() => {
    fetchProducts(1, 24);
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const featuredSource = products.filter((product) => product.is_featured);
  const featured = (featuredSource.length ? featuredSource : products).slice(
    0,
    HOME_SECTION_SIZE,
  );
  const featuredIds = new Set(featured.map((product) => product.id));

  const newArrivals = [...products]
    .filter((product) => !featuredIds.has(product.id))
    .sort(
      (a, b) =>
        (new Date(b.created_at).getTime() || 0) -
        (new Date(a.created_at).getTime() || 0),
    )
    .slice(0, HOME_SECTION_SIZE);

  return (
    <div className="w-full">
      <HeroSection />

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Browse
            </span>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Shop by category
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink-muted">
              Small departments, each edited down to the pieces that earn their
              place.
            </p>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
          >
            View everything
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <CategorySlider />
      </section>

      <section
        id="featured"
        className="border-y border-line bg-surface scroll-mt-32"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                Featured
              </span>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Editors&rsquo; picks
              </h2>
              <p className="mt-4 text-sm leading-6 text-ink-muted">
                The pieces we keep reaching for this month, chosen across every
                department.
              </p>
            </div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
            >
              See all
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ProductGrid products={featured} loading={productsLoading} />
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                Just landed
              </span>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                New arrivals
              </h2>
              <p className="mt-4 text-sm leading-6 text-ink-muted">
                The latest additions to the collection, freshest first.
              </p>
            </div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
            >
              Shop new in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ProductGrid products={newArrivals} loading={productsLoading} />
        </section>
      )}

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[2rem] bg-accent p-10 sm:p-12">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
            <div className="relative">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                <Truck className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-3xl font-semibold tracking-tight text-white">
                Free shipping over $100
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
                We cover delivery on every order past the threshold, dispatched
                within 24 hours.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-canvas px-7 text-sm font-medium text-ink transition-opacity hover:opacity-90"
              >
                Start shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-10 sm:p-12">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              <RotateCcw className="h-5 w-5" />
            </span>
            <h3 className="mt-6 text-3xl font-semibold tracking-tight text-ink">
              30 days to change your mind
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-ink-muted">
              Not quite right? Send it back within a month, no questions and no
              restocking fees.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-line-strong bg-surface px-7 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
            >
              Browse the collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
