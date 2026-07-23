"use client";

import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui";

type PaymentFormProps = {
  clientSecret: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  amount?: number;
  currency?: string;
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  onSuccess,
  onError,
  amount,
  currency,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!stripe || !elements) {
      onError("Payment library not loaded");
      return;
    }

    setProcessing(true);
    const card = elements.getElement(CardElement);
    if (!card) {
      onError("Card element not found");
      setProcessing(false);
      return;
    }

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        onError(result.error.message || "Payment failed");
      } else if (
        result.paymentIntent &&
        result.paymentIntent.status === "succeeded"
      ) {
        onSuccess("Payment completed successfully.");
      } else {
        onError("Payment not completed.");
      }
    } catch (err: any) {
      onError(err?.message || "Payment error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="rounded-lg border p-4 bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Payment</h3>
        <div className="text-sm font-bold">
          {(amount ?? 0).toLocaleString("en-US", {
            style: "currency",
            currency: (currency || "USD").toUpperCase(),
            minimumFractionDigits: 2,
          })}
        </div>
      </div>

      <div className="mb-3 text-xs text-zinc-500">
        Secure payment powered by Stripe
      </div>

      <div className="mb-4">
        <div className="border rounded p-3">
          <CardElement
            options={{ hidePostalCode: true }}
            onChange={(e) => {
              setCardError(e.error ? e.error.message : null);
              setCardBrand(e.brand || null);
            }}
          />
        </div>
        {cardBrand && (
          <div className="mt-2 text-xs text-zinc-600">
            Card brand: {cardBrand}
          </div>
        )}
        {cardError && (
          <div className="mt-2 text-xs text-red-600">{cardError}</div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          onClick={handleConfirm}
          disabled={processing || !stripe}
          className="px-4 py-2"
        >
          {processing ? "Processing…" : `Pay ${(amount ?? 0).toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;
