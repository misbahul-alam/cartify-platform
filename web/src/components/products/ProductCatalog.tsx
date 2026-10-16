"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import { useProductsStore } from "@/store/useProductsStore";
import { useCategoriesStore } from "@/store/useCategoriesStore";
import { EmptyState, Select, SkeletonCard } from "@/components/ui";

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
    <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-32 lg:w-72">
        <h2 className="font-display text-xl font-semibold text-ink">Filters</h2>

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
              className={`flex cursor-pointer items-center justify-between rounded-full px-4 py-2 text-left text-sm transition-colors ${
                selectedCategory === "all"
                  ? "bg-accent text-white"
                  : "text-ink-muted hover:bg-surface-muted hover:text-ink"
              }`}
            >
              <span>All categories</span>
              <span
                className={
                  selectedCategory === "all" ? "text-white/70" : "text-ink-subtle"
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
                  className={`flex cursor-pointer items-center justify-between rounded-full px-4 py-2 text-left text-sm capitalize transition-colors ${
                    active
                      ? "bg-accent text-white"
                      : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                  }`}
                >
                  <span className="truncate">{category.name}</span>
                  <span className={active ? "text-white/70" : "text-ink-subtle"}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <Select
            id="sort"
            label="Sort by"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            labelClassName="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-subtle"
          >
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="price-asc">Price (low to high)</option>
            <option value="price-desc">Price (high to low)</option>
          </Select>
        </div>
      </aside>

      <div className="w-full flex-1">
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
              onActionClick={() => {
                setSearchQuery("");
                handleCategoryChange("all");
              }}
            />
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-ink-subtle">
              Showing {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
