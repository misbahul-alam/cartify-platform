import React from "react";

type Props = {
  className?: string;
};

export const SkeletonBlock: React.FC<Props> = ({
  className = "h-10 w-1/4",
}) => (
  <div className={`animate-pulse rounded-lg bg-surface-muted ${className}`} />
);

export const SkeletonSquare: React.FC<Props> = ({ className = "" }) => (
  <div
    className={`aspect-square w-full animate-pulse rounded-2xl bg-surface-muted ${className}`}
  />
);

export const SkeletonCard: React.FC = () => (
  <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-3">
    <SkeletonSquare className="rounded-xl" />
    <div className="space-y-2 px-1 pb-1">
      <SkeletonBlock className="h-3.5 w-3/4" />
      <SkeletonBlock className="h-3.5 w-1/3" />
    </div>
  </div>
);

export const SkeletonRow: React.FC<Props> = ({ className = "h-24" }) => (
  <div className={`animate-pulse rounded-2xl bg-surface-muted ${className}`} />
);
