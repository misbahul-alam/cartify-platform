"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Download, Users } from "lucide-react";
import {
  AdminPageHeader,
  CopyButton,
  DataTable,
  Pill,
  ResultCount,
  SearchInput,
  SegmentedFilter,
  Toolbar,
  ToolbarGroup,
  roleTone,
  type DataColumn,
} from "@/components/admin";
import { Button } from "@/components/ui";
import { useAdminStore } from "@/store/useAdminStore";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatRelative, getInitials } from "@/lib/format";
import { toast } from "@/store/useToastStore";
import type { User } from "@/types";

const roles = ["customer", "seller", "admin"] as const;
type RoleFilter = "all" | (typeof roles)[number];

export const UsersTable: React.FC = () => {
  const users = useAdminStore((state) => state.users);
  const loading = useAdminStore((state) => state.usersLoading);
  const orders = useAdminStore((state) => state.orders);
  const fetchUsers = useAdminStore((state) => state.fetchUsers);
  const fetchAllOrders = useAdminStore((state) => state.fetchAllOrders);

  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");

  useEffect(() => {
    fetchUsers();
    fetchAllOrders();
  }, [fetchUsers, fetchAllOrders]);

  const stats = useMemo(() => {
    const map = new Map<string, { orders: number; spend: number }>();
    for (const order of orders) {
      const current = map.get(order.user_id) ?? { orders: 0, spend: 0 };
      current.orders += 1;
      current.spend += order.total_price;
      map.set(order.user_id, current);
    }
    return map;
  }, [orders]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      if (role !== "all" && user.role !== role) return false;
      if (!needle) return true;
      return (
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle)
      );
    });
  }, [users, query, role]);

  const handleExport = () => {
    downloadCsv(`users-${new Date().toISOString().slice(0, 10)}.csv`, [
      [
        "First name",
        "Last name",
        "Email",
        "Role",
        "Orders",
        "Spend",
        "Active",
        "Verified",
        "Joined",
      ],
      ...filtered.map((user) => {
        const stat = stats.get(user.id);
        return [
          user.first_name,
          user.last_name,
          user.email,
          user.role,
          stat?.orders ?? 0,
          stat?.spend ?? 0,
          user.is_active ? "yes" : "no",
          user.is_verified ? "yes" : "no",
          user.created_at,
        ];
      }),
    ]);
    toast.info(`Exported ${filtered.length} users.`);
  };

  const columns: DataColumn<User>[] = [
    {
      id: "user",
      header: "User",
      sortValue: (user) =>
        `${user.first_name} ${user.last_name}`.toLowerCase(),
      cell: (user) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-ink-muted">
            {getInitials(user.first_name, user.last_name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">
              {user.first_name} {user.last_name}
            </p>
            <p className="truncate text-xs text-ink-subtle">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      sortValue: (user) => user.role,
      cell: (user) => (
        <Pill tone={roleTone[user.role] || "neutral"}>{user.role}</Pill>
      ),
    },
    {
      id: "orders",
      header: "Orders",
      align: "right",
      sortValue: (user) => stats.get(user.id)?.orders ?? 0,
      cellClassName: "text-ink-muted tabular-nums",
      cell: (user) => stats.get(user.id)?.orders ?? 0,
    },
    {
      id: "spend",
      header: "Spend",
      align: "right",
      sortValue: (user) => stats.get(user.id)?.spend ?? 0,
      cellClassName: "font-medium text-ink tabular-nums",
      cell: (user) =>
        `$${(stats.get(user.id)?.spend ?? 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      id: "account",
      header: "Account",
      cell: (user) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {user.is_active !== undefined && (
            <Pill tone={user.is_active ? "success" : "danger"}>
              {user.is_active ? "active" : "disabled"}
            </Pill>
          )}
          {user.is_verified && <Pill tone="accent">verified</Pill>}
        </div>
      ),
    },
    {
      id: "id",
      header: "ID",
      cellClassName: "text-ink-muted",
      cell: (user) => (
        <div className="flex items-center gap-0.5">
          <span className="text-xs tabular-nums">{user.id.slice(0, 8)}</span>
          <CopyButton value={user.id} label="user id" />
        </div>
      ),
    },
    {
      id: "joined",
      header: "Joined",
      sortValue: (user) => new Date(user.created_at).getTime(),
      cellClassName: "text-ink-muted",
      cell: (user) => (
        <span title={formatDate(user.created_at)} className="whitespace-nowrap">
          {formatRelative(user.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Everyone with an account, with lifetime order counts and spend."
        actions={
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      <Toolbar className="mb-4">
        <ToolbarGroup className="w-full sm:w-auto">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search name or email"
            containerClassName="w-full sm:w-72"
          />
        </ToolbarGroup>

        <ToolbarGroup className="w-full justify-between sm:w-auto sm:justify-end">
          <ResultCount shown={filtered.length} total={users.length} noun="users" />
          <SegmentedFilter
            value={role}
            onChange={setRole}
            options={[
              { value: "all", label: "All", count: users.length },
              ...roles.map((value) => ({
                value,
                label: value,
                count: users.filter((user) => user.role === value).length,
              })),
            ]}
          />
        </ToolbarGroup>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(user) => user.id}
        loading={loading}
        pageSize={10}
        minWidthClassName="min-w-[980px]"
        emptyIcon={Users}
        emptyTitle="No users found"
        emptyDescription="No accounts match this search or role filter."
      />
    </div>
  );
};

export default UsersTable;
