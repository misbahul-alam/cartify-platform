"use client";

import React, { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { AdminSidebar, adminNavItems } from "./AdminSidebar";
import { CommandPalette } from "./CommandPalette";
import { UserMenu } from "./UserMenu";
import { Toaster } from "@/components/ui";
import { useAdminUiStore } from "@/store/useAdminUiStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminStore } from "@/store/useAdminStore";
import { cn } from "@/lib/cn";

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.data?.role);
  const collapsed = useAdminUiStore((state) => state.sidebarCollapsed);
  const sidebarOpen = useAdminUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useAdminUiStore((state) => state.toggleSidebar);
  const setSidebarOpen = useAdminUiStore((state) => state.setSidebarOpen);
  const setCommandOpen = useAdminUiStore((state) => state.setCommandOpen);
  const fetchAllOrders = useAdminStore((state) => state.fetchAllOrders);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const section = useMemo(() => {
    const match = adminNavItems.find(
      (item) =>
        item.href !== "/admin" &&
        pathname.startsWith(item.href) &&
        (role === undefined || item.roles.includes(role as "admin" | "seller")),
    );
    if (match) return match.label;
    return "Dashboard";
  }, [pathname, role]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas">
      <aside
        className={cn(
          "hidden h-full shrink-0 border-r border-line bg-surface transition-[width] duration-200 lg:block",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <AdminSidebar
          collapsed={collapsed}
          onToggleCollapse={toggleSidebar}
        />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
          />
          <div className="animate-slide-in absolute inset-y-0 left-0 w-72 max-w-[82%] border-r border-line bg-surface">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
            <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="z-40 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur-xl lg:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="truncate text-sm font-medium text-ink lg:hidden">
            {section}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface pl-3 pr-2 text-sm text-ink-subtle transition-colors hover:border-line-strong hover:text-ink-muted"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:block">Search</span>
              <kbd className="hidden rounded-md border border-line bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium sm:block">
                ⌘K
              </kbd>
            </button>

            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette />
      <Toaster />
    </div>
  );
};

export default AdminShell;
