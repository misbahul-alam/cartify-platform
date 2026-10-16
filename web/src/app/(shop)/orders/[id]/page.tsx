import { use } from "react";
import { OrderDetail } from "@/components/orders";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <OrderDetail orderId={id} />;
}
