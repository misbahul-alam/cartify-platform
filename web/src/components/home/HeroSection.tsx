"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { useProductsStore } from "@/store/useProductsStore";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
];

const marqueeItems = [
  "Free shipping over $100",
  "Secure Stripe checkout",
  "30-day easy returns",
  "Independently verified quality",
  "Dispatched within 24 hours",
];

const stats = [
  { value: "4.9/5", label: "Average rating" },
  { value: "120+", label: "Curated pieces" },
  { value: "30 days", label: "To change your mind" },
];

export const HeroSection: React.FC = () => {
  const products = useProductsStore((state) => state.products);

  const spotlight =
    products.find((product) => product.is_featured && product.images?.length) ||
    products.find((product) => product.images?.length);

  const secondary = products.find(
    (product) => product.id !== spotlight?.id && product.images?.length,
  );

  const spotlightImage = spotlight?.images?.[0]?.url || FALLBACK_IMAGES[0];
  const secondaryImage = secondary?.images?.[0]?.url || FALLBACK_IMAGES[1];

  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 -z-10 h-[560px] w-[560px] translate-x-1/3 -translate-y-1/3 rounded-full bg-accent-soft blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-medium text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            The 2026 edit is here
          </span>

          <h1 className="mt-7 text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Considered goods for the everyday.
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-ink-muted">
            An edited collection of objects chosen for how they look, how they
            last, and how little they ask of you.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Shop the collection
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#featured"
              className="inline-flex h-12 items-center justify-center rounded-full border border-line-strong bg-surface px-7 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
            >
              See featured
            </Link>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-semibold text-ink sm:text-3xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs leading-5 text-ink-subtle">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-soft blur-2xl"
          />

          <div className="absolute -right-6 top-1/2 hidden h-32 w-32 -translate-y-1/2 overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-2xl shadow-black/10 sm:block">
            <Image
              src={secondaryImage}
              alt=""
              aria-hidden="true"
              fill
              sizes="128px"
              className="object-cover object-center"
            />
          </div>

          <div className="relative aspect-square w-full overflow-hidden rounded-[2.5rem] border border-line bg-surface-muted shadow-2xl shadow-black/10">
            <Image
              src={spotlightImage}
              alt={spotlight?.name || "Featured product"}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 448px"
              className="object-cover object-center"
            />
            <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-canvas/90 px-3.5 py-1.5 text-xs font-medium text-ink backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              4.9 rated
            </span>
          </div>

          <div className="absolute -bottom-7 -left-4 w-64 rounded-2xl border border-line bg-surface p-5 shadow-2xl shadow-black/10 sm:-left-8">
            {spotlight ? (
              <>
                <p className="truncate text-[11px] uppercase tracking-widest text-ink-subtle">
                  {spotlight.category?.name || "Featured"}
                </p>
                <p className="mt-1.5 truncate text-lg font-semibold text-ink">
                  {spotlight.name}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">
                    $
                    {spotlight.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <Link
                    href={`/products/${spotlight.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent-strong"
                  >
                    View
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] uppercase tracking-widest text-ink-subtle">
                  The collection
                </p>
                <p className="mt-1.5 text-lg font-semibold text-ink">
                  120+ considered pieces
                </p>
                <Link
                  href="/products"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent-strong"
                >
                  Browse all
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-t border-line bg-surface py-4">
        <div className="flex w-max animate-marquee items-center">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span
              key={index}
              className="flex items-center whitespace-nowrap text-sm text-ink-muted"
            >
              <span className="px-6">{item}</span>
              <span className="h-1 w-1 rounded-full bg-line-strong" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
