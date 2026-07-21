"use client";

import React, { use } from "react";
import { ProductDetail } from "../../../features/products/components/ProductDetail";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return <ProductDetail slug={slug} />;
}
