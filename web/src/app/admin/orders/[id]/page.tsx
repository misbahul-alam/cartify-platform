import { use } from "react";
import { AdminOrderDetail } from "@/components/admin";

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <AdminOrderDetail orderId={id} />;
}
