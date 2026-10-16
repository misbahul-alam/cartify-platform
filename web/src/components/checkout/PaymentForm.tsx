"use client";

import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui";
import { getErrorMessage } from "@/lib/errors";

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

  const formattedAmount = (amount ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: (currency || "USD").toUpperCase(),
    minimumFractionDigits: 2,
  });

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
      } else if (result.paymentIntent?.status === "succeeded") {
        onSuccess("Payment completed successfully.");
      } else {
        onError("Payment not completed.");
      }
    } catch (error: unknown) {
      onError(getErrorMessage(error, "Payment error"));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Payment</h3>
        <span className="font-display text-lg font-semibold text-ink">
          {formattedAmount}
        </span>
      </div>

      <p className="mt-1 text-xs text-ink-muted">
        Secure payment powered by Stripe.
      </p>

      <div className="mt-5">
        <div className="rounded-xl border border-line p-4">
          <CardElement
            options={{ hidePostalCode: true }}
            onChange={(event) => {
              setCardError(event.error ? event.error.message : null);
              setCardBrand(event.brand || null);
            }}
          />
        </div>
        {cardBrand && (
          <p className="mt-2 text-xs capitalize text-ink-muted">
            Card brand: {cardBrand}
          </p>
        )}
        {cardError && <p className="mt-2 text-xs text-danger">{cardError}</p>}
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          onClick={handleConfirm}
          disabled={processing || !stripe}
          className="min-w-32"
        >
          {processing ? "Processing…" : `Pay ${(amount ?? 0).toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;
