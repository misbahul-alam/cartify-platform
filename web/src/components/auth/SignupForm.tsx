"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Lock, Mail } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import { getErrorMessage } from "@/lib/errors";

export function SignupForm() {
  const register = useAuthStore((state) => state.register);
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        confirm_password: confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => router.push("/signin"), 2500);
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-line bg-surface p-8 shadow-xl shadow-black/5 sm:p-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-medium text-accent-strong">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Join Cartify
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Save your cart and follow every order from one place.
        </p>

        {success ? (
          <div className="mt-7 flex flex-col items-center gap-3 rounded-2xl border border-success/20 bg-success-soft px-6 py-10 text-center">
            <CheckCircle2 className="h-9 w-9 text-success" />
            <p className="text-sm font-semibold text-ink">Account created</p>
            <p className="text-sm text-ink-muted">
              Taking you to sign in…
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="first_name"
                  required
                  label="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Jane"
                />
                <Input
                  id="last_name"
                  required
                  label="Last name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Doe"
                />
              </div>
              <Input
                id="email"
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
                type="password"
                autoComplete="new-password"
                required
                label="Password"
                icon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
              />
              <Input
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                label="Confirm password"
                icon={<Lock className="h-4 w-4" />}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
              />
              <Button type="submit" disabled={loading} fullWidth size="lg">
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-7 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupForm;
