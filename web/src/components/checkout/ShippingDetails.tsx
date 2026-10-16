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
    <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
          <MapPin className="h-4 w-4" />
        </span>
        <h2 className="font-display text-xl font-semibold text-ink">
          Shipping details
        </h2>
      </div>

      <Textarea
        id="address"
        required
        rows={3}
        value={shippingAddress}
        onChange={(event) => setShippingAddress(event.target.value)}
        placeholder="Street address, city, postal code, country"
        containerClassName="mt-6"
      />
    </div>
  );
};

export default ShippingDetails;
