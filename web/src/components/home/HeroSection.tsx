"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Search,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
} from "lucide-react";
import type { Category } from "@/types";
import { useCategoriesStore } from "@/store/useCategoriesStore";

interface HeroSectionProps {
  categories?: Category[];
}

const trustItems = [
  {
    icon: Truck,
    title: "Complimentary Delivery",
    description: "Free express shipping on all orders over $100",
  },
  {
    icon: RotateCcw,
    title: "30-Day Effortless Returns",
    description: "Simple, prepaid returns with zero restocking fees",
  },
  {
    icon: ShieldCheck,
    title: "Certified Authenticity",
    description: "Every piece strictly verified and guaranteed genuine",
  },
  {
    icon: Headphones,
    title: "Dedicated Client Care",
    description: "7-day personal concierge support whenever you need us",
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  categories: propCategories,
}) => {
  const storeCategories = useCategoriesStore((state) => state.categories);
  const activeCategories =
    propCategories && propCategories.length > 0
      ? propCategories
      : storeCategories.filter((c) => c.status === "public");

  return (
    <section className="relative isolate overflow-hidden border-b border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-140 w-225 -translate-x-1/2 rounded-full bg-linear-to-tr from-indigo-500/15 via-violet-500/10 to-sky-400/10 blur-[130px] dark:from-indigo-600/20 dark:via-purple-600/15 dark:to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-48 -z-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-[90px] dark:bg-indigo-600/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/4 -right-48 -z-10 h-80 w-80 rounded-full bg-violet-400/10 blur-[100px] dark:bg-violet-600/10"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 25%, #000 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 25%, #000 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-20 lg:px-8 lg:pt-28 lg:pb-24">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-zinc-200/90 bg-white/80 px-4 py-1.5 text-xs font-medium text-zinc-800 shadow-xs backdrop-blur-md transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:border-zinc-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="tracking-wide">Online Collection</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <span>Explore Edit</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-zinc-950 sm:text-6xl md:text-7xl lg:text-[4.75rem] lg:leading-[1.05] dark:text-zinc-50">
            Thoughtful design, <br className="hidden sm:inline" />
            crafted for{" "}
            <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300">
              elevated living.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
            An intentional curation of modern essentials for home, studio, and
            daily rituals. Engineered with timeless architectural simplicity,
            honest materials, and uncompromising detail.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-zinc-950 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-zinc-950/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 active:translate-y-0 sm:w-auto dark:bg-white dark:text-zinc-950 dark:shadow-none dark:hover:bg-zinc-100"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <a
              href="#featured"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200/90 bg-white/90 px-7 py-3.5 text-sm font-semibold text-zinc-700 shadow-xs backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:translate-y-0 sm:w-auto dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <span>Browse Featured</span>
            </a>
          </div>

          {activeCategories.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="mr-1 inline-flex items-center gap-1.5 font-medium text-zinc-400 dark:text-zinc-500">
                <Sparkles className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                Categories:
              </span>
              {activeCategories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/60 px-3.5 py-1.5 font-medium text-zinc-700 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-400 hover:bg-white hover:text-zinc-950 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-850 dark:hover:text-white"
                >
                  <span>✦</span>
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-200/80 bg-zinc-50/50 backdrop-blur-xs dark:border-zinc-800/80 dark:bg-zinc-900/30">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-zinc-200/70 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4 dark:divide-zinc-800/70">
          {trustItems.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group flex items-start gap-4 p-6 transition-colors hover:bg-white/80 dark:hover:bg-zinc-900/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/70 text-indigo-600 transition-colors group-hover:border-indigo-200 group-hover:bg-indigo-100/70 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-400 dark:group-hover:bg-indigo-900/40">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  {title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
