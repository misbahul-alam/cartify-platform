import { Suspense } from "react";
import { LoginForm } from "@/components/auth";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
          <div className="h-96 w-full max-w-md animate-pulse rounded-[2rem] bg-surface-muted" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
