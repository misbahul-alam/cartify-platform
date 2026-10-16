import { AdminOnly, UsersTable } from "@/components/admin";

export default function AdminUsersPage() {
  return (
    <AdminOnly>
      <UsersTable />
    </AdminOnly>
  );
}
