"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { useCategoriesStore } from "@/store/useCategoriesStore";


export const CategorySlider: React.FC = () => {
  const categories = useCategoriesStore((state) => state.categories);
  const loading = useCategoriesStore((state) => state.loading);
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      fetchCategories();
    }
  }, [categories, fetchCategories]);

  const publicCategories = (categories || []).filter(
    (c) => c.status === "public",
  );

  if (loading && publicCategories.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 w-full">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60 animate-pulse"
          >
            <div className="aspect-square w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-4 h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-2 h-3 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between">
              <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (publicCategories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <Compass className="mx-auto h-7 w-7 text-zinc-400 mb-2.5" />
        <p>Curated departments are being cataloged. Check back shortly.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 w-full">
      {publicCategories.map((cat) => {
        const image =
          cat.image_url ||
          "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600";

        return (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-3 sm:p-4 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 dark:hover:shadow-zinc-900/50"
          >
            <div>
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={image}
                  alt={cat.name}
                  className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-black/20" />
              </div>

              <div className="mt-3.5">
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 transition-colors group-hover:text-indigo-600 dark:text-zinc-50 dark:group-hover:text-indigo-400 line-clamp-1">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {cat.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs font-semibold text-zinc-600 transition-colors group-hover:text-indigo-600 dark:border-zinc-800/80 dark:text-zinc-400 dark:group-hover:text-indigo-400">
              <span>Shop department</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default CategorySlider;
