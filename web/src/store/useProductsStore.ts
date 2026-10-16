import { AxiosError } from "axios";
import { create } from "zustand";
import type { Product } from "@/types";
import { api } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";

export type ProductPayload = {
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  category_id?: string | null;
  is_stock: boolean;
  is_featured: boolean;
  status?: Product["status"];
};

type ProductsState = {
  products: Product[];
  page: number;
  limit: number;
  loading: boolean;
  saving: boolean;
  error?: string | null;
  selectedProduct?: Product | null;
  fetchProducts: (page?: number, limit?: number) => Promise<void>;
  fetchProductBySlug: (slug: string) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  checkSlug: (slug: string) => Promise<Product | null>;
  createProduct: (payload: ProductPayload) => Promise<void>;
  updateProduct: (
    id: string,
    payload: ProductPayload,
    options?: { refresh?: boolean },
  ) => Promise<Product | void>;
  deleteProduct: (id: string, options?: { refresh?: boolean }) => Promise<void>;
  uploadProductImage: (id: string, file: File) => Promise<void>;
  deleteProductImage: (id: string, imageId: string) => Promise<void>;
  setPrimaryImage: (id: string, imageId: string) => Promise<void>;
  clear: () => void;
};

const unwrap = (payload: { success?: boolean; message?: string }) => {
  if (!payload || !payload.success) {
    throw new Error(payload?.message || "Request failed");
  }
};

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  page: 1,
  limit: 20,
  loading: false,
  saving: false,
  error: null,
  async fetchProducts(page = 1, limit = 20) {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/products", { params: { page, limit } });
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to fetch products");
      set({ products: res.data.data || [], page, limit, loading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to fetch products"),
        loading: false,
      });
    }
  },
  async fetchProductBySlug(slug: string) {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/products/slug/${slug}`);
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to fetch product");
      set({ selectedProduct: res.data.data || null, loading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to fetch product"),
        loading: false,
      });
    }
  },
  async fetchProductById(id: string) {
    const res = await api.get(`/products/${id}`);
    if (!res.data || !res.data.success)
      throw new Error(res.data?.message || "Failed to fetch product");
    return (res.data.data as Product) || null;
  },
  async checkSlug(slug: string) {
    try {
      const res = await api.get(`/products/slug/${slug}`);
      if (!res.data || !res.data.success)
        throw new Error(res.data?.message || "Failed to fetch product");
      return (res.data.data as Product) ?? null;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
  async createProduct(payload: ProductPayload) {
    set({ saving: true, error: null });
    try {
      unwrap((await api.post("/products", payload)).data);
      await get().fetchProducts(1, 100);
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to create product"),
        saving: false,
      });
      throw error;
    }
    set({ saving: false });
  },
  async updateProduct(id, payload, options) {
    set({ saving: true, error: null });
    try {
      unwrap((await api.put(`/products/${id}`, payload)).data);
      if (options?.refresh ?? true) await get().fetchProducts(1, 100);
      else set({ saving: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to update product"),
        saving: false,
      });
      throw error;
    }
  },
  async deleteProduct(id, options) {
    set({ saving: true, error: null });
    try {
      unwrap((await api.delete(`/products/${id}`)).data);
      set({
        products: get().products.filter((product) => product.id !== id),
        saving: false,
      });
      if (options?.refresh) await get().fetchProducts(1, 100);
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to delete product"),
        saving: false,
      });
      throw error;
    }
  },
  async uploadProductImage(id: string, file: File) {
    set({ saving: true, error: null });
    try {
      const formData = new FormData();
      formData.append("image", file);
      unwrap(
        (
          await api.post(`/products/${id}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        ).data,
      );
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to upload image"),
        saving: false,
      });
      throw error;
    }
    set({ saving: false });
  },
  async deleteProductImage(id: string, imageId: string) {
    set({ saving: true, error: null });
    try {
      unwrap((await api.delete(`/products/${id}/images/${imageId}`)).data);
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to delete image"),
        saving: false,
      });
      throw error;
    }
    set({ saving: false });
  },
  async setPrimaryImage(id: string, imageId: string) {
    set({ saving: true, error: null });
    try {
      unwrap(
        (await api.patch(`/products/${id}/images/${imageId}/primary`)).data,
      );
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to set primary image"),
        saving: false,
      });
      throw error;
    }
    set({ saving: false });
  },
  clear() {
    set({ products: [], page: 1, limit: 20, error: null });
  },
}));

export default useProductsStore;
