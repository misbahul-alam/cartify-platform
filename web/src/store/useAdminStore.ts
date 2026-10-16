import { create } from "zustand";
import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import type { Order, User } from "@/types";

type AdminState = {
  users: User[];
  orders: Order[];
  usersLoading: boolean;
  ordersLoading: boolean;
  saving: boolean;
  error?: string | null;
  fetchUsers: () => Promise<void>;
  fetchAllOrders: (page?: number, limit?: number) => Promise<void>;
  updateOrderStatus: (
    id: string,
    status: Order["status"],
    options?: { refresh?: boolean },
  ) => Promise<void>;
};

const unwrap = (payload: { success?: boolean; message?: string }) => {
  if (!payload || !payload.success) {
    throw new Error(payload?.message || "Request failed");
  }
};

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  orders: [],
  usersLoading: false,
  ordersLoading: false,
  saving: false,
  error: null,
  async fetchUsers() {
    set({ usersLoading: true, error: null });
    try {
      const res = await api.get("/users");
      unwrap(res.data);
      set({ users: res.data.data || [], usersLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to fetch users"),
        usersLoading: false,
      });
    }
  },
  async fetchAllOrders(page = 1, limit = 100) {
    set({ ordersLoading: true, error: null });
    try {
      const res = await api.get("/orders/all", { params: { page, limit } });
      unwrap(res.data);
      set({ orders: res.data.data || [], ordersLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to fetch orders"),
        ordersLoading: false,
      });
    }
  },
  async updateOrderStatus(id, status, options) {
    set({ saving: true, error: null });
    try {
      unwrap((await api.put(`/orders/${id}/status`, { status })).data);
      set({
        orders: get().orders.map((order) =>
          order.id === id ? { ...order, status } : order,
        ),
      });
      if (options?.refresh ?? true) await get().fetchAllOrders();
      else set({ saving: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to update order status"),
        saving: false,
      });
      throw error;
    }
  },
}));

export default useAdminStore;
