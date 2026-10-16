import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, ReactNode } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  icon?: ReactNode;
  containerClassName?: string;
  labelClassName?: string;
};

export function Input({
  id,
  label,
  icon,
  containerClassName,
  labelClassName,
  className,
  ...props
}: InputProps) {
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
        <input
          id={id}
          className={cn(
            "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-50",
            Boolean(icon) && "pl-11",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
}
