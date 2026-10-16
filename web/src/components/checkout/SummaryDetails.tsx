"use client";

import React from "react";
import type { Product } from "@/types";

type SummaryItem = {
  product: Product;
  quantity: number;
  subtotal: number;
};

type SummaryDetailsProps = {
  items: SummaryItem[];
  totalPrice: number;
  shippingCost: number;
  finalTotal: number;
};

const SummaryDetails: React.FC<SummaryDetailsProps> = ({
  items,
  totalPrice,
  shippingCost,
  finalTotal,
}) => {
  return (
    <>
      <h2 className="font-display text-xl font-semibold text-ink">
        Your order
      </h2>

      <div className="mt-5 max-h-48 space-y-3.5 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="truncate text-ink-muted">
              {item.product.name}{" "}
              <span className="text-ink-subtle">×{item.quantity}</span>
            </span>
            <span className="shrink-0 font-medium text-ink">
              ${item.subtotal.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3.5 border-t border-line pt-4">
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <span>Items</span>
          <span className="font-medium text-ink">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <span>Shipping</span>
          {shippingCost === 0 ? (
            <span className="text-xs font-semibold uppercase tracking-wide text-success">
              Free
            </span>
          ) : (
            <span className="font-medium text-ink">
              ${shippingCost.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm font-semibold text-ink">Total</span>
          <span className="font-display text-2xl font-semibold text-ink">
            ${finalTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </>
  );
};

export default SummaryDetails;
