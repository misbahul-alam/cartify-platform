import { ProductDetail } from "@/components/products";
import { use } from "react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return <ProductDetail slug={slug} />;
}
