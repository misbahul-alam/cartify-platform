"use client";

import { CheckCircle2, CircleAlert, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type SlugState = "idle" | "checking" | "available" | "taken" | "error";

const config: Record<
  SlugState,
  { icon: LucideIcon; className: string; label: string; spin?: boolean }
> = {
  idle: { icon: Loader2, className: "", label: "" },
  checking: {
    icon: Loader2,
    className: "text-ink-subtle",
    label: "Checking availability…",
    spin: true,
  },
  available: {
    icon: CheckCircle2,
    className: "text-success",
    label: "Available",
  },
  taken: {
    icon: CircleAlert,
    className: "text-warning",
    label: "Already in use",
  },
  error: {
    icon: CircleAlert,
    className: "text-danger",
    label: "Could not check this slug",
  },
};

export function SlugAvailability({
  state,
  message,
}: {
  state: SlugState;
  message?: string;
}) {
  if (state === "idle") return null;

  const { icon: Icon, className, label, spin } = config[state];

  return (
    <p
      className={cn("flex items-center gap-1.5 text-xs", className)}
      role="status"
      aria-live="polite"
    >
      <Icon className={cn("h-3.5 w-3.5", spin && "animate-spin")} />
      {message || label}
    </p>
  );
}

export default SlugAvailability;
