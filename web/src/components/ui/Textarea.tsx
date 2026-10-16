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
            "mb-2 block text-sm font-medium text-ink",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}
