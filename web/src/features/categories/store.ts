import { create } from "zustand";
import { api } from "@/lib/axios";
import type { Category } from "@/types";

type CategoriesState = {
  categories: Category[];
  loading: boolean;
  error?: string | null;
  fetchCategories: () => Promise<void>;
  clear: () => void;
};

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  loading: false,
  error: null,
  async fetchCategories() {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/categories/new");
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to fetch categories");
      set({ categories: res.data.data || [], loading: false });
    } catch (err: any) {
      set({ error: err?.message ?? String(err), loading: false });
    }
  },
  clear() {
    set({ categories: [], loading: false, error: null });
  },
}));

export default useCategoriesStore;
