"use client";

import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import PaymentForm from "./PaymentForm";

type Props = {
  clientSecret: string;
  amount: number;
  currency?: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

const PaymentSection: React.FC<Props> = ({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError,
}) => {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm
        clientSecret={clientSecret}
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default PaymentSection;
