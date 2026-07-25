"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import type { Category, Product } from "@/types";
import useProductsStore from "@/store/useProductsStore";
import { useCategoriesStore } from "@/store/useCategoriesStore";
import { CategorySlider, ProductCard } from "@/components/products";

const benefits = [
  { icon: Truck, title: "Free shipping", description: "On orders over $100" },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    description: "Protected payments",
  },
  {
    icon: PackageCheck,
    title: "Easy returns",
    description: "Simple, clear process",
  },
  {
    icon: Headphones,
    title: "Helpful support",
    description: "Here when you need us",
  },
];

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

      const categories = (useCategoriesStore.getState().categories || [])
        .filter((category) => category.status === "public")
        .slice(0, 3);
      setExploreCategories(categories);
    }
    loadHomeData();
  }, [fetchCategories, fetchProducts]);

  return (
    <div className="w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <section className="relative isolate overflow-hidden border-b border-zinc-200/70 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,.17),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(168,85,247,.15),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-zinc-50 dark:from-zinc-950" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[1fr_.95fr] lg:items-center lg:gap-18 lg:px-8 lg:py-24">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" /> New arrivals, thoughtfully
              selected
            </div>
            <h1 className="max-w-xl text-5xl font-extrabold tracking-[-0.06em] text-zinc-950 dark:text-white sm:text-6xl lg:text-7xl">
              Make every day feel{" "}
              <span className="relative whitespace-nowrap text-indigo-600 dark:text-indigo-400">
                more yours.
                <svg
                  viewBox="0 0 180 12"
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 h-3 w-full text-indigo-300 dark:text-indigo-700"
                >
                  <path
                    d="M2 9c40-9 97-9 176 0"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
              Discover quality essentials for work, home, and the moments in
              between. Simple browsing, safe checkout, and a collection you will
              want to come back to.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-premium hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Shop new arrivals <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#featured"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white/75 px-6 py-3.5 text-sm font-bold text-zinc-800 transition-premium hover:border-indigo-200 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Search className="h-4 w-4" /> See featured picks
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-indigo-600" /> Carefully
                chosen products
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600" /> Secure
                checkout
              </span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-indigo-400/20 blur-3xl" />
            <div className="grid grid-cols-[.76fr_1fr] gap-3 sm:gap-5">
              <div className="relative mt-12 overflow-hidden rounded-4xl border-4 border-white bg-zinc-100 shadow-xl shadow-zinc-900/15 dark:border-zinc-900 dark:bg-zinc-900">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85"
                  alt="A modern watch from the Cartify collection"
                  className="aspect-[.72] h-full w-full object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-4xl border-4 border-white bg-zinc-100 shadow-2xl shadow-zinc-900/20 dark:border-zinc-900 dark:bg-zinc-900">
                <img
                  src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&w=900&q=85"
                  alt="Fresh products arranged on a table"
                  className="aspect-[.83] h-full w-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/70 bg-white/90 p-3.5 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/85">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-1 text-xs font-bold text-zinc-900 dark:text-white">
                    A better way to shop everyday
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -right-2 top-7 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-xl backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/85 sm:-right-5">
              <p className="text-lg font-extrabold tracking-tight text-zinc-950 dark:text-white">
                24/7
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                shopping, simplified
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="border-b border-zinc-200/70 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-zinc-200/70 px-4 dark:divide-zinc-800 sm:grid-cols-4 sm:divide-y-0 sm:px-6 lg:px-8">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-center gap-3 px-3 py-6 sm:px-5"
            >
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {title}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section
        id="categories"
        className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              Shop by category
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Start with what interests you.
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              A simple place to browse the collection.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-500 sm:inline-flex"
          >
            View catalog <ArrowRight className="h-4 w-4" />
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
      <section className="border-y border-zinc-200/70 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                Explore more
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Pick a corner of the collection.
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-500 sm:inline-flex"
            >
              Explore more <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {exploreCategories.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {exploreCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group relative min-h-56 overflow-hidden rounded-2xl bg-zinc-900 p-6"
                >
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={`${category.name} collection`}
                      className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-75"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-violet-600 to-zinc-900" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-950/90 via-zinc-950/10" />
                  <div className="relative flex h-full flex-col justify-end">
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                      {category.description?.trim() || "Fresh picks"}
                    </p>
                    <h3 className="mt-2 text-2xl font-extrabold text-white">
                      {category.name}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-white">
                      Shop category{" "}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="min-h-56 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
                />
              ))}
            </div>
          )}
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
