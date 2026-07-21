"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Category, Product } from "@/types";
import useProductsStore from "../store";
import ProductCard from "./ProductCard";
import { Search, SlidersHorizontal, Sparkles, ArrowUpDown } from "lucide-react";
import { useCategoriesStore } from "@/features/categories/store";
import { EmptyState, Input, Select, SkeletonCard } from "@/shared/ui";

export const ProductCatalog: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const productsLoading = useProductsStore();
  const categoriesLoading = useCategoriesStore((s) => s.loading);
  const fetchProducts = useProductsStore((s) => s.fetchProducts);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  const loading = productsLoading || categoriesLoading;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");

  useEffect(() => {
    const catParam = searchParams.get("category");
    setSelectedCategory(catParam || "all");

    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      try {
        await Promise.all([fetchProducts(1, 100), fetchCategories()]);
        setProducts(useProductsStore.getState().products || []);
        setCategories(useCategoriesStore.getState().categories || []);
      } catch (err) {
        console.error("Failed to load catalog data:", err);
      }
    }
    fetchData();
  }, []);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`/products?${params.toString()}`);
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
        case "name-asc":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      <aside className="w-full lg:w-64 shrink-0 border border-zinc-200/80 rounded-2xl bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50">
          <SlidersHorizontal className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider">
            Filters
          </h2>
        </div>

        <div className="mb-6">
          <Input
            type="text"
            label="Search"
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find a product..."
            className="py-2 text-xs"
            labelClassName="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
            Categories
          </label>
          <div className="space-y-1">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/40"
              }`}
            >
              <span>All Categories</span>
              <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-bold text-zinc-500">
                {products.length}
              </span>
            </button>

            {categories.map((cat) => {
              const count = products.filter(
                (p) => p.category?.slug === cat.slug,
              ).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat.slug
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <span className="capitalize">{cat.name}</span>
                  <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-bold text-zinc-500">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
            icon={<ArrowUpDown className="h-4 w-4" />}
            labelClassName="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
            className="py-2 text-xs"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </Select>
        </div>
      </aside>

      <div className="flex-1 w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No products found"
            description="We couldn't find any products matching your active filters. Try searching for something else or clearing the filters."
            actionLabel="Reset Filters"
            onActionClick={() => {
              setSearchQuery("");
              handleCategoryChange("all");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
