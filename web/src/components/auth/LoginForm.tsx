"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import { getErrorMessage } from "@/lib/errors";

export function LoginForm() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const syncCartWithServer = useCartStore((state) => state.syncCartWithServer);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push(redirectUrl);
  }, [user, redirectUrl, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      await syncCartWithServer();
      router.push(redirectUrl);
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-line bg-surface p-8 shadow-xl shadow-black/5 sm:p-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-medium text-accent-strong">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Welcome back
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">
          Sign in to Cartify
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Continue to your cart, orders and saved details.
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            label="Email"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            label="Password"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
          <Button type="submit" disabled={loading} fullWidth size="lg">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-7 text-center text-sm text-ink-muted">
          New to Cartify?{" "}
          <Link
            href="/signup"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
