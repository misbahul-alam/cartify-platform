"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useOrdersStore } from "@/store/useOrdersStore";
import type { Order } from "@/types";
import { Breadcrumb, Button } from "@/components/ui";
import { getErrorMessage } from "@/lib/errors";
import ShippingDetails from "./ShippingDetails";
import SummaryDetails from "./SummaryDetails";

const PaymentSection = dynamic(() => import("./PaymentSection"), {
  ssr: false,
  loading: () => (
    <div className="h-40 w-full animate-pulse rounded-2xl border border-line bg-surface-muted" />
  ),
});

export const CheckoutContainer: React.FC = () => {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const createOrder = useOrdersStore((state) => state.createOrder);
  const createPaymentIntent = useOrdersStore(
    (state) => state.createPaymentIntent,
  );

  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [paymentMsg, setPaymentMsg] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const shippingCost = totalPrice >= 100 ? 0 : 9.99;
  const finalTotal = totalPrice + shippingCost;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const createdOrder = await createOrder({
        shipping_address: shippingAddress,
      });

      setSuccessOrder(createdOrder);

      try {
        const paymentData = await createPaymentIntent({
          order_id: createdOrder.id,
          provider: "stripe",
        });

        if (paymentData?.client_secret) {
          setClientSecret(paymentData.client_secret);
          return;
        }

        if (paymentData) {
          setPaymentMsg("Payment authorised successfully.");
        }
      } catch (paymentError: unknown) {
        console.warn("Payment intent unavailable", paymentError);
        setPaymentMsg(
          "Order saved. Card payment was skipped and the mock gateway was used.",
        );
      }

      await clearCart();
    } catch (submitError: unknown) {
      setError(
        getErrorMessage(submitError, "Something went wrong during checkout."),
      );
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center rounded-[2rem] border border-line bg-surface p-8 text-center shadow-xl shadow-black/5 sm:p-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink">
            Order confirmed
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Thank you for your purchase. Your order reference is{" "}
            <span className="font-mono text-xs font-medium text-ink">
              {successOrder.id}
            </span>
            .
          </p>

          {paymentMsg && (
            <div className="mt-6 w-full rounded-2xl bg-surface-muted p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-subtle">
                Payment status
              </p>
              <p className="mt-1.5 text-sm text-ink-muted">{paymentMsg}</p>
            </div>
          )}

          {clientSecret && (
            <div className="mt-6 w-full">
              <PaymentSection
                clientSecret={clientSecret}
                amount={finalTotal}
                currency="USD"
                onSuccess={async (message: string) => {
                  setPaymentMsg(message);
                  await clearCart();
                }}
                onError={(message: string) => setError(message)}
              />
            </div>
          )}

          <div className="mt-8 flex w-full flex-col gap-3">
            <Link
              href="/orders"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              View your orders
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-ink-muted transition-colors hover:text-accent"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <div className="mb-10">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          One last step and your order is on its way.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <ShippingDetails
            shippingAddress={shippingAddress}
            setShippingAddress={setShippingAddress}
          />
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-32">
          <SummaryDetails
            items={items}
            totalPrice={totalPrice}
            shippingCost={shippingCost}
            finalTotal={finalTotal}
          />

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            size="lg"
            className="mt-7"
          >
            {loading ? "Placing order…" : "Place order"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutContainer;
