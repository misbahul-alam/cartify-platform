import { AdminOnly, CategoryManager } from "@/components/admin";

export default function AdminCategoriesPage() {
  return (
    <AdminOnly>
      <CategoryManager />
    </AdminOnly>
  );
}
