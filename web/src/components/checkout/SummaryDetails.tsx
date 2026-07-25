"use client";

import React from "react";

type SummaryDetailsProps = {
  items: any[];
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
      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        Summary Recap
      </h2>

      <div className="space-y-4 max-h-48 overflow-y-auto mb-6">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex justify-between items-center text-xs gap-3"
          >
            <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[150px]">
              {item.product.name}{" "}
              <span className="text-zinc-400">x{item.quantity}</span>
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              ${item.subtotal.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Items Total</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-50">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Shipping</span>
          {shippingCost === 0 ? (
            <span className="font-bold text-green-600 dark:text-green-400 uppercase text-[9px] tracking-wider">
              Free
            </span>
          ) : (
            <span className="font-bold text-zinc-900 dark:text-zinc-50">
              ${shippingCost.toFixed(2)}
            </span>
          )}
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
            Grand Total
          </span>
          <span className="text-xl font-extrabold text-zinc-955 dark:text-zinc-50">
            ${finalTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </>
  );
};

export default SummaryDetails;
