"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { Textarea } from "@/components/ui";

type ShippingDetailsProps = {
  shippingAddress: string;
  setShippingAddress: (v: string) => void;
};

const ShippingDetails: React.FC<ShippingDetailsProps> = ({
  shippingAddress,
  setShippingAddress,
}) => {
  return (
    <div className="border border-zinc-200/80 rounded-2xl bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50">
        <MapPin className="h-5 w-5 text-indigo-650" />
        <h2 className="text-xs font-bold uppercase tracking-wider">
          Shipping Details
        </h2>
      </div>

      <Textarea
        id="address"
        required
        rows={3}
        value={shippingAddress}
        onChange={(e) => setShippingAddress(e.target.value)}
        placeholder="123 Main St, Apt 4B, New York, NY 10001"
        label="Full Shipping Address"
        labelClassName="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
      />
    </div>
  );
};

export default ShippingDetails;
