import { create } from "zustand";
import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
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
      const res = await api.get("/categories");
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to fetch categories");
      set({ categories: res.data.data || [], loading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, "Failed to fetch categories"), loading: false });
    }
  },
  clear() {
    set({ categories: [], loading: false, error: null });
  },
}));

export default useCategoriesStore;
