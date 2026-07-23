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
      className={`flex items-center gap-1.5 text-xs font-medium text-zinc-500 ${className}`}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-3 w-3" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors capitalize"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-50">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
