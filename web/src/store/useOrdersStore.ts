import { api } from "@/lib/axios";
import type { Order } from "@/types";
import { create } from "zustand";

type OrdersState = {
  orders: Order[];
  loading: boolean;
  error?: string | null;
  fetchOrders: (page?: number, limit?: number) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
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
      set({ orders: res.data.data.data || [], loading: false });
    } catch (err: any) {
      set({ error: err?.message ?? String(err), loading: false });
    }
  },
  async cancelOrder(id: string) {
    set({ loading: true, error: null });
    try {
      const res = await api.post(`/orders/${id}/cancel`);
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to cancel order");

      await get().fetchOrders();
    } catch (err: any) {
      set({ error: err?.message ?? String(err), loading: false });
    } finally {
      set({ loading: false });
    }
  },
  clear() {
    set({ orders: [], loading: false, error: null });
  },
}));

export default useOrdersStore;
