import { cn } from "@/lib/cn";
import type { ReactNode, TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  containerClassName?: string;
  labelClassName?: string;
};

export function Textarea({
  id,
  label,
  containerClassName,
  labelClassName,
  className,
  ...props
}: TextareaProps) {
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
      <textarea
        id={id}
        className={cn(
          "block w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none ring-offset-2 ring-indigo-500 transition-colors placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-offset-zinc-900",
          className,
        )}
        {...props}
      />
    </div>
  );
}
