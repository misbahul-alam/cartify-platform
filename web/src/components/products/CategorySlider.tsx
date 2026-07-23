"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Category } from "@/types";
import { Sparkles } from "lucide-react";
import { useCategoriesStore } from "@/store/useCategoriesStore";

export const CategorySlider: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const {
    categories: categoriesState,
    loading,
    fetchCategories,
  } = useCategoriesStore();

  useEffect(() => {
    async function loadData() {
      try {
        await fetchCategories();
        setCategories(
          (useCategoriesStore.getState().categories || []).slice(0, 5),
        );
      } catch (err) {
        console.error("Failed to fetch category slider:", err);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className="flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-200/60 bg-white hover:border-indigo-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500 transition-premium group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="mt-4 text-xs font-bold text-zinc-900 dark:text-zinc-100 capitalize">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default CategorySlider;
