"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  Lock,
  Mail,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";

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
      });
      setSuccess(true);
      setTimeout(() => router.push("/signin"), 3000);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }
  const smallInput = "py-2.5 text-sm";
  const fieldLabel = "mb-1";
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Join Cartify to get premium shopping deals
          </p>
        </div>
        {success ? (
          <div className="flex flex-col items-center gap-3 rounded-lg bg-green-50 p-6 text-center text-sm text-green-800 dark:bg-green-950/20 dark:text-green-400">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            <div className="text-base font-semibold">Account Created!</div>
            <p>
              Registration was successful. You are being redirected to the login
              page...
            </p>
          </div>
        ) : (
          <>
            <>
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="first_name"
                    required
                    label="First Name"
                    icon={<UserIcon className="h-4 w-4" />}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="John"
                    className={smallInput}
                    labelClassName={fieldLabel}
                  />
                  <Input
                    id="last_name"
                    required
                    label="Last Name"
                    icon={<UserIcon className="h-4 w-4" />}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Doe"
                    className={smallInput}
                    labelClassName={fieldLabel}
                  />
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  label="Email Address"
                  icon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="john@example.com"
                  className={smallInput}
                  labelClassName={fieldLabel}
                />
                <Input
                  id="password"
                  type="password"
                  required
                  label="Password"
                  icon={<Lock className="h-4 w-4" />}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter a password"
                  className={smallInput}
                  labelClassName={fieldLabel}
                />
                <Input
                  id="confirm_password"
                  type="password"
                  required
                  label="Confirm Password"
                  icon={<Lock className="h-4 w-4" />}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
                  className={smallInput}
                  labelClassName={fieldLabel}
                />
              </div>
              <Button type="submit" disabled={loading} fullWidth size="lg">
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
            <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Log in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SignupForm;
