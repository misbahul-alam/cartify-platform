"use client";

import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
  className?: string;
}> = ({ value, onChange, placeholder, containerClassName, className }) => {
  return (
    <div className={cn("relative", containerClassName)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-accent focus:ring-2 focus:ring-accent/15",
          className,
        )}
      />
    </div>
  );
};

export default SearchInput;
