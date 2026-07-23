import React from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
};

export const EmptyState: React.FC<Props> = ({
  icon: Icon,
  title,
  description,
  actionLabel = "Explore Catalog",
  actionHref,
  onActionClick,
}) => {
  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-24 sm:px-6 lg:px-8 text-center bg-zinc-50 dark:bg-zinc-950">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 mb-6">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 mt-2">{description}</p>
      {actionLabel &&
        (actionHref ? (
          <Link
            href={actionHref}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : onActionClick ? (
          <button
            onClick={onActionClick}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            {actionLabel}
          </button>
        ) : null)}
    </div>
  );
};

export default EmptyState;
