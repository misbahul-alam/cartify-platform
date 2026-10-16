"use client";

import React from "react";
import { cn } from "@/lib/cn";

export const Toolbar: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={cn(
      "flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between",
      className,
    )}
  >
    {children}
  </div>
);

export const ToolbarGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("flex flex-wrap items-center gap-2", className)}>
    {children}
  </div>
);

export const SegmentedFilter = <T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[];
  className?: string;
}) => (
  <div
    role="tablist"
    className={cn(
      "flex flex-wrap items-center gap-1 rounded-xl bg-surface-muted p-1",
      className,
    )}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            active
              ? "bg-surface text-ink shadow-sm"
              : "text-ink-muted hover:text-ink",
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span
              className={cn(
                "tabular-nums",
                active ? "text-ink-subtle" : "text-ink-subtle/80",
              )}
            >
              {option.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export const ResultCount: React.FC<{
  shown: number;
  total: number;
  noun: string;
}> = ({ shown, total, noun }) => (
  <p className="px-1 text-xs text-ink-subtle">
    {shown === total
      ? `${total} ${noun}`
      : `${shown} of ${total} ${noun}`}
  </p>
);
