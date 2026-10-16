"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export const Breadcrumbs: React.FC<{ items: Crumb[] }> = ({ items }) => (
  <nav aria-label="Breadcrumb">
    <ol className="flex items-center gap-1.5 text-xs">
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 && (
            <ChevronRight className="h-3 w-3 text-ink-subtle/70" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-ink-subtle transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-muted">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
