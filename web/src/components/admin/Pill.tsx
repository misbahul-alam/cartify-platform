import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type PillTone = "neutral" | "accent" | "success" | "warning" | "danger";

const tones: Record<PillTone, string> = {
  neutral: "bg-surface-muted text-ink-muted",
  accent: "bg-accent-soft text-accent-strong",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export function Pill({
  tone = "neutral",
  className,
  children,
}: {
  tone?: PillTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const orderStatusTone: Record<string, PillTone> = {
  pending: "warning",
  processing: "accent",
  paid: "success",
  shipped: "accent",
  delivered: "success",
  cancelled: "danger",
};

export const productStatusTone: Record<string, PillTone> = {
  active: "success",
  inactive: "neutral",
  draft: "warning",
};

export const roleTone: Record<string, PillTone> = {
  admin: "accent",
  seller: "warning",
  customer: "neutral",
};

export default Pill;
