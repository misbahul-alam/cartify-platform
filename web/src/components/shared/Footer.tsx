"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Mail } from "lucide-react";
import { useCategoriesStore } from "@/store/useCategoriesStore";

const accountLinks = [
  { label: "Your orders", href: "/orders" },
  { label: "Your cart", href: "/cart" },
  { label: "Sign in", href: "/signin" },
  { label: "Create account", href: "/signup" },
];

const paymentMethods = ["Visa", "Mastercard", "Amex", "Stripe"];

export const Footer: React.FC = () => {
  const categories = useCategoriesStore((state) => state.categories);

  const publicCategories = categories
    .filter((category) => category.status === "public")
    .slice(0, 4);

  const shopLinks = [
    { label: "All products", href: "/products" },
    { label: "Featured picks", href: "/#featured" },
    { label: "New arrivals", href: "/products" },
    ...publicCategories.map((category) => ({
      label: category.name,
      href: `/products?category=${category.slug}`,
    })),
  ];

  return (
    <footer className="mt-auto bg-ink text-canvas">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-semibold tracking-tight">
                Cartify
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-canvas/60">
              A small, carefully edited collection of goods — paired with a
              checkout that gets out of the way.
            </p>
            <Link
              href="/products"
              className="mt-7 inline-flex h-11 items-center rounded-full bg-canvas px-6 text-sm font-medium text-ink transition-opacity hover:opacity-90"
            >
              Browse the collection
            </Link>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-canvas/40">
              Shop
            </h3>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm capitalize text-canvas/70 transition-colors hover:text-canvas"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-canvas/40">
              Account
            </h3>
            <ul className="mt-5 space-y-3">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-canvas/70 transition-colors hover:text-canvas"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-canvas/40">
              Contact
            </h3>
            <a
              href="mailto:hello@cartify.dev"
              className="mt-5 inline-flex items-center gap-2 text-sm text-canvas/70 transition-colors hover:text-canvas"
            >
              <Mail className="h-4 w-4" />
              hello@cartify.dev
            </a>
            <p className="mt-4 max-w-xs text-sm leading-6 text-canvas/50">
              Questions about an order or a product? We reply within one
              business day.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-canvas/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xs text-canvas/50">
            © {new Date().getFullYear()} Cartify. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-canvas/40">Secure payments</span>
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="rounded-md border border-canvas/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-canvas/60"
              >
                {method}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <p className="text-xs text-canvas/50">
              Crafted by{" "}
              <a
                href="https://misbahulala.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-canvas/70 transition-colors hover:text-canvas"
              >
                Misbahul Alam
              </a>
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-canvas/15 text-canvas/70 transition-colors hover:border-canvas/40 hover:text-canvas"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
