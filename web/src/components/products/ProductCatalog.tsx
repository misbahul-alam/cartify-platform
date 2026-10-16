"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowUpDown,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import ProductCard from "./ProductCard";
import { useProductsStore } from "@/store/useProductsStore";
import { useCategoriesStore } from "@/store/useCategoriesStore";
import { EmptyState, Select, SkeletonCard } from "@/components/ui";
import { cn } from "@/lib/cn";

export const ProductCatalog: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const products = useProductsStore((state) => state.products);
  const productsLoading = useProductsStore((state) => state.loading);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const categories = useCategoriesStore((state) => state.categories);
  const categoriesLoading = useCategoriesStore((state) => state.loading);
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);

  const selectedCategory = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || "",
  );
  const [sortBy, setSortBy] = useState("name-asc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchProducts(1, 100);
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products");
    setFiltersOpen(false);
  };

  const activeCategory = categories.find(
    (category) => category.slug === selectedCategory,
  );
  const trimmedQuery = searchQuery.trim();
  const activeFilterCount =
    (trimmedQuery ? 1 : 0) + (selectedCategory !== "all" ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const resetFilters = () => {
    setSearchQuery("");
    if (selectedCategory !== "all") handleCategoryChange("all");
  };

  const filteredProducts = products
    .filter((product) => {
      if (
        selectedCategory !== "all" &&
        product.category?.slug !== selectedCategory
      ) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const loading = productsLoading || categoriesLoading;

  return (
    <div className="flex w-full flex-col gap-8 pt-10 lg:flex-row lg:items-start lg:gap-12">
      <aside className="w-full shrink-0 lg:sticky lg:top-32 lg:w-72">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className="flex w-full cursor-pointer items-center justify-between rounded-full border border-line bg-surface px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-line-strong lg:hidden"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-ink-muted" />
            Filters
          </span>
          {hasActiveFilters ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          ) : (
            <ChevronDown
              className={cn(
                "h-4 w-4 text-ink-subtle transition-transform",
                filtersOpen && "rotate-180",
              )}
            />
          )}
        </button>

        <div
          className={cn(
            "mt-4 rounded-2xl border border-line bg-surface p-6 lg:mt-0 lg:block",
            filtersOpen ? "block" : "hidden",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink">
              Filters
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="cursor-pointer text-xs font-medium text-accent transition-colors hover:text-accent-strong"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="relative mt-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-subtle">
              Category
            </p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleCategoryChange("all")}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-full px-4 py-2 text-left text-sm transition-colors",
                  selectedCategory === "all"
                    ? "bg-accent text-white"
                    : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                )}
              >
                <span>All categories</span>
                <span
                  className={
                    selectedCategory === "all"
                      ? "text-white/70"
                      : "text-ink-subtle"
                  }
                >
                  {products.length}
                </span>
              </button>

              {categories.map((category) => {
                const count = products.filter(
                  (product) => product.category?.slug === category.slug,
                ).length;
                const active = selectedCategory === category.slug;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.slug)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-full px-4 py-2 text-left text-sm capitalize transition-colors",
                      active
                        ? "bg-accent text-white"
                        : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                    )}
                  >
                    <span className="truncate">{category.name}</span>
                    <span
                      className={
                        active ? "text-white/70" : "text-ink-subtle"
                      }
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      <div className="w-full min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <p className="text-sm text-ink-subtle">
            {loading && filteredProducts.length === 0 ? (
              "Loading products…"
            ) : (
              <>
                Showing{" "}
                <span className="font-medium text-ink">
                  {filteredProducts.length}
                </span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </>
            )}
          </p>

          <div className="flex items-center gap-3">
            <label
              htmlFor="sort"
              className="hidden text-xs font-semibold uppercase tracking-widest text-ink-subtle sm:block"
            >
              Sort
            </label>
            <Select
              id="sort"
              icon={<ArrowUpDown className="h-4 w-4" />}
              containerClassName="w-full sm:w-56"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="price-asc">Price (low to high)</option>
              <option value="price-desc">Price (high to low)</option>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {selectedCategory !== "all" && activeCategory && (
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface py-1.5 pl-3.5 pr-3 text-xs font-medium text-ink transition-colors hover:border-line-strong"
              >
                <span className="text-ink-subtle">Category</span>
                <span className="capitalize">{activeCategory.name}</span>
                <X className="h-3.5 w-3.5 text-ink-subtle transition-colors group-hover:text-ink" />
              </button>
            )}

            {trimmedQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface py-1.5 pl-3.5 pr-3 text-xs font-medium text-ink transition-colors hover:border-line-strong"
              >
                <span className="text-ink-subtle">Search</span>
                <span className="max-w-40 truncate">{trimmedQuery}</span>
                <X className="h-3.5 w-3.5 text-ink-subtle transition-colors group-hover:text-ink" />
              </button>
            )}

            <button
              type="button"
              onClick={resetFilters}
              className="cursor-pointer px-2 text-xs font-medium text-ink-muted transition-colors hover:text-accent"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mt-6">
          {loading && filteredProducts.length === 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line-strong">
              <EmptyState
                icon={Sparkles}
                title="Nothing matched"
                description="No products fit the current filters. Try a different search or reset them."
                actionLabel="Reset filters"
                onActionClick={resetFilters}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
