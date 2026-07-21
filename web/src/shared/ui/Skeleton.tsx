import React from "react";

type Props = {
  className?: string;
};

export const SkeletonBlock: React.FC<Props> = ({
  className = "h-10 w-1/4",
}) => (
  <div
    className={`rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse ${className}`}
  />
);

export const SkeletonSquare: React.FC<Props> = ({ className = "" }) => (
  <div
    className={`aspect-square w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse ${className}`}
  />
);

export const SkeletonCard: React.FC = () => (
  <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <SkeletonSquare className="rounded-xl" />
    <SkeletonBlock className="h-4 w-3/4" />
    <SkeletonBlock className="h-4 w-1/4" />
  </div>
);

export const SkeletonRow: React.FC<Props> = ({ className = "h-24" }) => (
  <div
    className={`rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse ${className}`}
  />
);
