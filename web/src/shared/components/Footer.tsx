import React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              <ShoppingBag className="h-6 w-6" />
              <span>Cartify</span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
              Cartify is a modern, high-performance e-commerce platform built
              for developers, by developers. Experience blazing fast checkout
              and catalog navigation.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wider uppercase mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=electronics"
                  className="text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=clothing"
                  className="text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Clothing
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=books"
                  className="text-sm text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Books
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 cursor-not-allowed">
                  FAQ
                </span>
              </li>
              <li>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 cursor-not-allowed">
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 cursor-not-allowed">
                  Returns
                </span>
              </li>
              <li>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 cursor-not-allowed">
                  Contact Us
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wider uppercase mb-4">
              Technology
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Built with Next.js, TypeScript, and Tailwind CSS. Powered by a
              modern API architecture for seamless performance and scalability.
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} Cartify Platform. All rights
            reserved.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Built with ❤️ by the Cartify Team. |{" "}
            <a
              href="https://misbahulala.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Misbahul Alam
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
