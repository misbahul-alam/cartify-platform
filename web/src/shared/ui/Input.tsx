import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

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
            "mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={cn(
            "block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-offset-2 ring-indigo-500 transition-colors placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-offset-zinc-900",
            Boolean(icon) && "pl-10",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
}
