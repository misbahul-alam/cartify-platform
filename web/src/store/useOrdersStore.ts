import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import type { Order, PaymentIntentResponse } from "@/types";
import { create } from "zustand";

type OrdersState = {
  orders: Order[];
  loading: boolean;
  error?: string | null;
  fetchOrders: (page?: number, limit?: number) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  createOrder: (payload: { shipping_address: string }) => Promise<Order>;
  createPaymentIntent: (opts: {
    order_id: string;
    provider: string;
  }) => Promise<PaymentIntentResponse>;
  clear: () => void;
};

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  async fetchOrders(page = 1, limit = 50) {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/orders", { params: { page, limit } });
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to fetch orders");
      set({ orders: res.data.data || [], loading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, "Failed to fetch orders"), loading: false });
    }
  },
  async cancelOrder(id: string) {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to cancel order");

      await get().fetchOrders();
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, "Failed to cancel order"), loading: false });
    } finally {
      set({ loading: false });
    }
  },
  async createOrder(payload) {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/orders", payload);
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to create order");

      const created: Order = res.data.data;
      set({ orders: [created, ...(get().orders || [])], loading: false });
      return created;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, "Failed to create order"), loading: false });
      throw error;
    }
  },
  async createPaymentIntent(opts) {
    set({ loading: true, error: null });
    try {
      const res = await api.post(`/payments/intent`, opts);
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to create payment intent");

      set({ loading: false });
      return res.data.data as PaymentIntentResponse;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, "Failed to create payment intent"), loading: false });
      throw error;
    }
  },
  clear() {
    set({ orders: [], loading: false, error: null });
  },
}));

export default useOrdersStore;
