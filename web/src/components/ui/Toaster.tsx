"use client";

import { useEffect } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToastStore, type Toast, type ToastTone } from "@/store/useToastStore";
import { cn } from "@/lib/cn";

const tones: Record<ToastTone, { icon: React.ComponentType<{ className?: string }>; style: string }> = {
  success: { icon: CheckCircle2, style: "text-success" },
  error: { icon: XCircle, style: "text-danger" },
  info: { icon: Info, style: "text-accent" },
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const dismiss = useToastStore((state) => state.dismiss);
  const { icon: Icon, style } = tones[toast.tone];

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <div className="animate-rise pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-xl shadow-black/5">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style)} />
      <p className="flex-1 text-sm text-ink">{toast.message}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dismiss(toast.id)}
        className="cursor-pointer text-ink-subtle transition-colors hover:text-ink"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export const Toaster: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6 sm:top-6"
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} />
      ))}
    </div>
  );
};

export default Toaster;
