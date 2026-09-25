"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, PackageCheck, Search, ShoppingBag } from "lucide-react";
import type { Category, Product } from "@/types";
import useProductsStore from "@/store/useProductsStore";
import { useCategoriesStore } from "@/store/useCategoriesStore";
import { CategorySlider, ProductCard } from "@/components/products";
import { HeroSection } from "@/components/home";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [exploreCategories, setExploreCategories] = useState<Category[]>([]);
  const { loading, fetchProducts } = useProductsStore();
  const { fetchCategories } = useCategoriesStore();

  useEffect(() => {
    async function loadHomeData() {
      await Promise.all([fetchProducts(1, 20), fetchCategories()]);
      const products = useProductsStore.getState().products || [];
      const featured = products
        .filter((product) => product.is_featured)
        .slice(0, 4);
      setFeaturedProducts(featured.length ? featured : products.slice(0, 4));

      const categories = (useCategoriesStore.getState().categories || []).filter(
        (category) => category.status === "public"
      );
      setExploreCategories(categories);
    }
    loadHomeData();
  }, [fetchCategories, fetchProducts]);

  return (
    <div className="w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <HeroSection categories={exploreCategories} />
      <section
        id="categories"
        className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              Curated Departments
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
              Explore by category.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl">
              Distinctive collections assembled with intentional design, honest materials, and functional simplicity.
            </p>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <span>View complete catalog</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <CategorySlider />
      </section>
      <section
        id="featured"
        className="border-y border-zinc-200/70 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-900/40"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                Handpicked for you
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Featured right now.
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                A few products worth a closer look.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-500"
            >
              See everything <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <div className="aspect-square animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              New featured products will appear here soon.
            </div>
          )}
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            The Cartify way
          </p>
          <h2 className="mt-3 max-w-md text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            A smoother route from find to front door.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            We keep the shopping experience focused: discover what fits, check
            out with confidence, then follow your order with ease.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-500"
          >
            Start exploring <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Search className="h-5 w-5" />
            </div>
            <p className="mt-5 text-sm font-bold text-zinc-900 dark:text-zinc-50">
              1. Discover
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              Use categories and filters to find the right item faster.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <p className="mt-5 text-sm font-bold text-zinc-900 dark:text-zinc-50">
              2. Check out
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              A secure, clear checkout makes placing an order simple.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <PackageCheck className="h-5 w-5" />
            </div>
            <p className="mt-5 text-sm font-bold text-zinc-900 dark:text-zinc-50">
              3. Enjoy
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              Track your orders and come back whenever inspiration strikes.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-zinc-950 px-6 py-12 text-center text-white shadow-xl sm:px-12">
          <ShoppingBag className="mx-auto h-8 w-8 text-indigo-300" />
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight">
            Ready to find your next favorite?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
            Browse the complete selection and add the pieces that fit your day.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-900 transition-premium hover:bg-indigo-50"
          >
            Browse the catalog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
