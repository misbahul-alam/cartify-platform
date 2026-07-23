import { create } from "zustand";
import type { Product } from "@/types";
import { api } from "@/lib/axios";

type ProductsState = {
  products: Product[];
  page: number;
  limit: number;
  loading: boolean;
  error?: string | null;
  selectedProduct?: Product | null;
  fetchProducts: (page?: number, limit?: number) => Promise<void>;
  fetchProductBySlug: (slug: string) => Promise<void>;
  clear: () => void;
};

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  page: 1,
  limit: 20,
  loading: false,
  error: null,
  async fetchProducts(page = 1, limit = 20) {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/products", { params: { page, limit } });
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to fetch products");
      set({ products: res.data.data || [], page, limit, loading: false });
    } catch (err: any) {
      set({ error: err?.message ?? String(err), loading: false });
    }
  },
  async fetchProductBySlug(slug: string) {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/products/slug/${slug}`);
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to fetch product");
      set({ selectedProduct: res.data.data || null, loading: false });
    } catch (err: any) {
      set({ error: err?.message ?? String(err), loading: false });
    }
  },
  clear() {
    set({ products: [], page: 1, limit: 20, error: null });
  },
}));

export default useProductsStore;
