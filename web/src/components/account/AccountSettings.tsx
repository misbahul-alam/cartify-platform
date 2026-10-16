"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  UserRound,
} from "lucide-react";
import { Breadcrumb, Button, Input, SkeletonBlock } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/cn";

type Message = { tone: "success" | "error"; text: string };

const Feedback: React.FC<{ message: Message | null }> = ({ message }) => {
  if (!message) return null;

  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        message.tone === "success" ? "text-success" : "text-danger",
      )}
    >
      {message.tone === "success" && <CheckCircle2 className="h-4 w-4" />}
      {message.text}
    </p>
  );
};

export const AccountSettings: React.FC = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<Message | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<Message | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/signin?redirect=/account");
    }
  }, [user, router]);

  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => setConfirmDelete(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      await updateProfile({
        first_name: String(data.get("first_name") ?? "").trim(),
        last_name: String(data.get("last_name") ?? "").trim(),
      });
      setProfileMessage({ tone: "success", text: "Profile updated." });
    } catch (error: unknown) {
      setProfileMessage({
        tone: "error",
        text: getErrorMessage(error, "Could not update your profile."),
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPassword = String(data.get("new_password") ?? "");
    const confirmPassword = String(data.get("confirm_password") ?? "");

    setPasswordMessage(null);

    if (newPassword.length < 8 || newPassword.length > 20) {
      setPasswordMessage({
        tone: "error",
        text: "Your password must be between 8 and 20 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        tone: "error",
        text: "The new passwords do not match.",
      });
      return;
    }

    setPasswordSaving(true);

    try {
      await updatePassword({
        old_password: String(data.get("old_password") ?? ""),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      form.reset();
      setPasswordMessage({ tone: "success", text: "Password updated." });
    } catch (error: unknown) {
      setPasswordMessage({
        tone: "error",
        text: getErrorMessage(error, "Could not update your password."),
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleteSaving(true);
    setDeleteMessage(null);

    try {
      await deleteAccount();
      router.push("/");
    } catch (error: unknown) {
      setDeleteMessage({
        tone: "error",
        text: getErrorMessage(error, "Could not delete your account."),
      });
      setDeleteSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <SkeletonBlock className="mb-8 h-10 w-1/3" />
        <div className="space-y-6">
          <SkeletonBlock className="h-56 rounded-2xl" />
          <SkeletonBlock className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Account" }]} />

      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Account
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Signed in as {user.data.email}
        </p>
      </div>

      <div className="space-y-6">
        <form
          onSubmit={handleProfileSubmit}
          className="rounded-2xl border border-line bg-surface p-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
              <UserRound className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">Profile</h2>
              <p className="text-sm text-ink-muted">
                The name that shows up on your orders.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Input
              id="first_name"
              name="first_name"
              label="First name"
              maxLength={30}
              required
              defaultValue={user.data.first_name ?? ""}
            />
            <Input
              id="last_name"
              name="last_name"
              label="Last name"
              maxLength={30}
              required
              defaultValue={user.data.last_name ?? ""}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={profileSaving}>
              {profileSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {profileSaving ? "Saving…" : "Save profile"}
            </Button>
            <Feedback message={profileMessage} />
          </div>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-2xl border border-line bg-surface p-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">Password</h2>
              <p className="text-sm text-ink-muted">
                Use 8 to 20 characters you don&rsquo;t use anywhere else.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <Input
              id="old_password"
              name="old_password"
              type="password"
              label="Current password"
              autoComplete="current-password"
              required
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                id="new_password"
                name="new_password"
                type="password"
                label="New password"
                autoComplete="new-password"
                minLength={8}
                maxLength={20}
                required
              />
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                label="Confirm new password"
                autoComplete="new-password"
                minLength={8}
                maxLength={20}
                required
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={passwordSaving}>
              {passwordSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {passwordSaving ? "Updating…" : "Update password"}
            </Button>
            <Feedback message={passwordMessage} />
          </div>
        </form>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-danger-soft text-danger">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">Delete account</h2>
              <p className="text-sm text-ink-muted">
                Permanently remove your account and sign out. This can&rsquo;t be
                undone.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button
              type="button"
              variant={confirmDelete ? "primary" : "secondary"}
              className={
                confirmDelete ? "bg-danger text-white hover:opacity-90" : ""
              }
              onClick={handleDelete}
              disabled={deleteSaving}
            >
              {deleteSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {deleteSaving
                ? "Deleting…"
                : confirmDelete
                  ? "Yes, delete my account"
                  : "Delete account"}
            </Button>
            {confirmDelete && !deleteSaving && (
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="cursor-pointer text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                Keep my account
              </button>
            )}
            <Feedback message={deleteMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
