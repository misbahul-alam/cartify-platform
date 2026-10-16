import React from "react";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";

const statusStyles: Record<string, string> = {
  delivered: "bg-success-soft text-success",
  paid: "bg-accent-soft text-accent-strong",
  shipped: "bg-accent-soft text-accent-strong",
  processing: "bg-warning-soft text-warning",
  pending: "bg-warning-soft text-warning",
  cancelled: "bg-danger-soft text-danger",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> =
  {
    delivered: CheckCircle2,
    paid: CheckCircle2,
    shipped: Truck,
    processing: Clock,
    pending: Clock,
    cancelled: XCircle,
  };

export const OrderStatusBadge: React.FC<{
  status: string;
  className?: string;
}> = ({ status, className }) => {
  const key = status.toLowerCase();
  const Icon = statusIcons[key] || Package;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium capitalize",
        statusStyles[key] || "bg-surface-muted text-ink-muted",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {key}
    </span>
  );
};

export default OrderStatusBadge;
