"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/cn";

const itemClass =
  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink";

export const UserMenu: React.FC = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const profile = user?.data;

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!profile) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-2.5 transition-colors hover:border-line-strong",
          open && "border-line-strong",
        )}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
          {getInitials(profile.first_name, profile.last_name)}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-medium text-ink sm:block">
          {profile.first_name}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="animate-rise absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl shadow-black/10"
        >
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-sm font-medium text-ink">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="truncate text-xs text-ink-subtle">{profile.email}</p>
            <span className="mt-2 inline-flex rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
              {profile.role}
            </span>
          </div>

          <div className="mt-1">
            <Link
              href="/admin/orders"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <ShoppingBag className="h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <Settings className="h-4 w-4" />
              Account settings
            </Link>
            <Link
              href="/"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <Store className="h-4 w-4" />
              View store
            </Link>
            <Link
              href="/orders"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <Package className="h-4 w-4" />
              My orders
            </Link>
          </div>

          <div className="mt-1 border-t border-line pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
                router.push("/");
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-soft"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
