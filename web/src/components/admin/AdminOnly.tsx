"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const role = useAuthStore((state) => state.user?.data?.role);

  if (role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
          Administrators only
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Your role does not have access to this section.
        </p>
        <Link
          href="/admin/orders"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
        >
          Go to orders
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminOnly;
