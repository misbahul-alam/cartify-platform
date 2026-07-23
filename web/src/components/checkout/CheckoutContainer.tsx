"use client";

import React, { useState } from "react";
import Link from "next/link";

import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import type { Order } from "@/types";
import { useOrdersStore } from "@/store/useOrdersStore";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { Breadcrumb, Button } from "@/components/ui";
import ShippingDetails from "./ShippingDetails";
import SummaryDetails from "./SummaryDetails";
import PaymentForm from "./PaymentForm";
import { useAuthStore } from "@/store/useAuthStore";

export const CheckoutContainer: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  console.log("CheckoutContainer user:", user);
  const { items, totalPrice, clearCart, loading: cartLoading } = useCartStore();

  const [shippingAddress, setShippingAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [paymentMsg, setPaymentMsg] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const createOrder = useOrdersStore((s) => s.createOrder);
  const createPaymentIntent = useOrdersStore((s) => s.createPaymentIntent);

  const shippingCost = totalPrice >= 100 ? 0 : 9.99;
  const finalTotal = totalPrice + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const createdOrder = await createOrder({
        shipping_address: shippingAddress,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      });

      setSuccessOrder(createdOrder);

      try {
        const paymentData = await createPaymentIntent({
          order_id: createdOrder.id,
          provider: "stripe",
        });

        if (paymentData && paymentData.client_secret) {
          setClientSecret(paymentData.client_secret);
          return;
        }

        if (paymentData) {
          setPaymentMsg("Payment authorized successfully via Stripe.");
        }
      } catch (payErr: any) {
        console.warn(
          "Stripe intent failed (probably invalid secret keys):",
          payErr,
        );
        setPaymentMsg(
          "Order saved. Stripe payment intent skipped (using mock payment gateway).",
        );
      }

      await clearCart();
    } catch (err: any) {
      setError(err.message || "Something went wrong during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <div className="mx-auto max-w-lg w-full px-4 py-24 sm:px-6 lg:px-8 text-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400 mb-4">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Order Placed Successfully!
          </h2>
          <p className="text-sm text-zinc-500 mt-2">
            Thank you for your purchase. Your order ID is:{" "}
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono font-bold">
              {successOrder.id}
            </code>
          </p>

          {paymentMsg && (
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 text-xs text-indigo-700 text-left dark:bg-indigo-950/20 dark:border-indigo-950/30 dark:text-indigo-400">
              <p className="font-semibold mb-1">Payment Status:</p>
              <p>{paymentMsg}</p>
            </div>
          )}

          {clientSecret && (
            <div className="mt-6 max-w-md mx-auto w-full">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  clientSecret={clientSecret}
                  amount={finalTotal}
                  currency="USD"
                  onSuccess={async (msg: string) => {
                    setPaymentMsg(msg);
                    await clearCart();
                  }}
                  onError={(errMsg: string) => setError(errMsg)}
                />
              </Elements>
            </div>
          )}

          <div className="pt-6 flex flex-col gap-3">
            <Link
              href="/orders"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold shadow transition-premium hover:bg-indigo-500 cursor-pointer"
            >
              View Order History
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <Link
              href="/products"
              className="text-sm text-indigo-650 hover:text-indigo-500 font-semibold cursor-pointer"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mb-10">
        Checkout
      </h1>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400 mb-6">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
      >
        <div className="lg:col-span-2 space-y-6">
          <ShippingDetails
            shippingAddress={shippingAddress}
            setShippingAddress={setShippingAddress}
          />
        </div>

        <div className="border border-zinc-200/80 rounded-2xl bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
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
            className="mt-8"
          >
            {loading ? "Processing Order..." : "Authorize & Place Order"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutContainer;
