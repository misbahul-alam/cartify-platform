"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import type { Order } from "@/types";
import { api } from "@/lib/axios";
import { Breadcrumb, Button, Input, Textarea } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";

export const CheckoutContainer: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  console.log("CheckoutContainer user:", user);
  const { items, totalPrice, clearCart, loading: cartLoading } = useCartStore();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [cardName, setCardName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [paymentMsg, setPaymentMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/signin?redirect=/checkout");
    } else {
      setCardName(`${user.data.first_name} ${user.data.last_name}`);
    }
  }, [user]);

  useEffect(() => {
    if (!cartLoading && items.length === 0 && !successOrder) {
      router.push("/cart");
    }
  }, [items, cartLoading, successOrder]);

  const shippingCost = totalPrice >= 100 ? 0 : 9.99;
  const finalTotal = totalPrice + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const orderRes = await api.post("/orders", {
        shipping_address: shippingAddress,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      });
      if (!orderRes.data || !orderRes.data.success) {
        throw new Error(orderRes.data?.message || "Failed to create order");
      }

      const createdOrder = orderRes.data;
      setSuccessOrder(createdOrder);

      try {
        const paymentRes = await api.post(`/payments/stripe-intent`, {
          order_id: createdOrder.id,
          amount: finalTotal,
          currency: "usd",
        });
        if (paymentRes.data && paymentRes.data.success) {
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

          <div className="border border-zinc-200/80 rounded-2xl bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-6 border-b border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50">
              <CreditCard className="h-5 w-5 text-indigo-650" />
              <h2 className="text-xs font-bold uppercase tracking-wider">
                Payment Details (Stripe Simulator)
              </h2>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                required
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                label="Name on Card"
                labelClassName="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
              />

              <Input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                label="Card Number"
                labelClassName="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  required
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  label="Expiry Date"
                  labelClassName="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
                />
                <Input
                  type="text"
                  required
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  label="CVV"
                  labelClassName="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border border-zinc-200/80 rounded-2xl bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
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
