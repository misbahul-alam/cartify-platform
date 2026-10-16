import { AxiosError } from "axios";
import { create } from "zustand";
import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";
import type { Category } from "@/types";

export type CategoryPayload = {
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  status?: Category["status"];
  parent_id?: string | null;
};

type CategoriesState = {
  categories: Category[];
  loading: boolean;
  saving: boolean;
  error?: string | null;
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: string) => Promise<Category>;
  checkSlug: (slug: string) => Promise<Category | null>;
  createCategory: (payload: CategoryPayload) => Promise<void>;
  updateCategory: (id: string, payload: CategoryPayload) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clear: () => void;
};

const unwrap = (payload: { success?: boolean; message?: string }) => {
  if (!payload || !payload.success) {
    throw new Error(payload?.message || "Request failed");
  }
};

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  loading: false,
  saving: false,
  error: null,
  async fetchCategories() {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/categories", { params: { limit: 100 } });
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to fetch categories");
      set({ categories: res.data.data || [], loading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to fetch categories"),
        loading: false,
      });
    }
  },
  async fetchCategoryById(id: string) {
    const res = await api.get(`/categories/${id}`);
    if (!res.data || !res.data.success)
      throw new Error(res.data?.message || "Failed to fetch category");
    return res.data.data as Category;
  },
  async checkSlug(slug: string) {
    try {
      const res = await api.get(`/categories/slug/${slug}`);
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to fetch category");
      return (res.data.data as Category) ?? null;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
  async createCategory(payload: CategoryPayload) {
    set({ saving: true, error: null });
    try {
      unwrap((await api.post("/categories/", payload)).data);
      if (payload.status && payload.status !== "public") {
        const res = await api.get("/categories", { params: { limit: 100 } });
        const created = (res.data?.data || []).find(
          (category: Category) => category.slug === payload.slug,
        );
        if (created) {
          await api.put(`/categories/${created.id}`, payload);
        }
      }
      await get().fetchCategories();
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to create category"),
        saving: false,
      });
      throw error;
    }
    set({ saving: false });
  },
  async updateCategory(id: string, payload: CategoryPayload) {
    set({ saving: true, error: null });
    try {
      unwrap((await api.put(`/categories/${id}`, payload)).data);
      await get().fetchCategories();
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to update category"),
        saving: false,
      });
      throw error;
    }
    set({ saving: false });
  },
  async deleteCategory(id: string) {
    set({ saving: true, error: null });
    try {
      unwrap((await api.delete(`/categories/${id}`)).data);
      set({
        categories: get().categories.filter(
          (category) => category.id !== id,
        ),
      });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to delete category"),
        saving: false,
      });
      throw error;
    }
    set({ saving: false });
  },
  clear() {
    set({ categories: [], loading: false, error: null });
  },
}));

export default useCategoriesStore;
