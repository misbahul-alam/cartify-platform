"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { AdminShell } from "@/components/admin";
import { useMounted } from "@/lib/useMounted";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const mounted = useMounted();

  const isStaff = user?.data?.role === "admin" || user?.data?.role === "seller";

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.replace("/signin?redirect=/admin");
    }
  }, [mounted, loading, user, router]);

  if (!mounted || (loading && !user)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Redirecting to sign in
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          You need a staff account to open the panel.
        </p>
        <Link
          href="/signin?redirect=/admin"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
          Not authorised
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          This area is reserved for administrators and sellers. Your account role
          is &ldquo;{user.data?.role || "unknown"}&rdquo;.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
        >
          Back to the store
        </Link>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
