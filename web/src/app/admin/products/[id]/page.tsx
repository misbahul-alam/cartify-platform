import { use } from "react";
import { AdminOnly, ProductForm } from "@/components/admin";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AdminOnly>
      <ProductForm productId={id} />
    </AdminOnly>
  );
}
