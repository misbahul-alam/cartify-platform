"use client";

import { LoginForm } from "@/features/auth";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
          <div className="h-64 w-full max-w-md rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
