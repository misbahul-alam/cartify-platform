import { AdminOnly, ProductsManager } from "@/components/admin";

export default function AdminProductsPage() {
  return (
    <AdminOnly>
      <ProductsManager />
    </AdminOnly>
  );
}
