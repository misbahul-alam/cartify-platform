import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ReactNode, SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  icon?: ReactNode;
  containerClassName?: string;
  labelClassName?: string;
};

export function Select({
  id,
  label,
  icon,
  containerClassName,
  labelClassName,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "mb-2 block text-sm font-medium text-ink",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-subtle">
            {icon}
          </div>
        )}
        <select
          id={id}
          className={cn(
            "w-full cursor-pointer appearance-none rounded-xl border border-line bg-surface py-3 pl-4 pr-10 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent/10",
            Boolean(icon) && "pl-11",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
      </div>
    </div>
  );
}
