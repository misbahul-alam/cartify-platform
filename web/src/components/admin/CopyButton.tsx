"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

export const CopyButton: React.FC<{
  value: string;
  label?: string;
  className?: string;
}> = ({ value, label, className }) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied" : `Copy ${label ?? value}`}
      aria-label={copied ? "Copied" : `Copy ${label ?? value}`}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-1.5 py-1 text-xs text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied && <span className="text-success">Copied</span>}
    </button>
  );
};

export default CopyButton;
