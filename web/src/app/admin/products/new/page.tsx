import { AdminOnly, ProductForm } from "@/components/admin";

export default function NewProductPage() {
  return (
    <AdminOnly>
      <ProductForm />
    </AdminOnly>
  );
}
