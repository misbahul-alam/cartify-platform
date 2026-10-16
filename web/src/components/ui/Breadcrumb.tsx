import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

export const Breadcrumb: React.FC<Props> = ({ items, className = "mb-8" }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-1.5 text-xs tracking-wide text-ink-subtle ${className}`}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
          {item.href ? (
            <Link
              href={item.href}
              className="capitalize transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ) : (
            <span className="truncate font-medium capitalize text-ink">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
