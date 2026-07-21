import { create } from "zustand";
import { useAuthStore } from "../auth/store";
import type { Product } from "@/types";
import { api } from "@/lib/axios";

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  loading: boolean;
  initialize: () => void;
  fetchCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCartWithServer: () => Promise<void>;
  recalculate: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalPrice: 0,
  totalItems: 0,
  loading: true,

  initialize: () => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      get().fetchCart();
    } else {
      if (typeof window !== "undefined") {
        try {
          const savedCart = localStorage.getItem("guest_cart");
          if (savedCart) {
            const parsed = JSON.parse(savedCart);
            set({ items: parsed, loading: false });
            get().recalculate();
          } else {
            set({ items: [], loading: false });
          }
        } catch (err) {
          console.error("Failed to load local cart:", err);
          set({ loading: false });
        }
      } else {
        set({ loading: false });
      }
    }
  },

  recalculate: () => {
    const items = get().items;
    const totalPrice = items.reduce((acc, item) => acc + item.subtotal, 0);
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    set({ totalPrice, totalItems });
  },

  fetchCart: async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      if (typeof window !== "undefined") {
        try {
          const savedCart = localStorage.getItem("guest_cart");
          if (savedCart) {
            set({ items: JSON.parse(savedCart), loading: false });
          } else {
            set({ items: [], loading: false });
          }
          get().recalculate();
        } catch (err) {
          console.error(err);
        }
      }
      return;
    }

    set({ loading: true });
    try {
      const res = await api.get("/cart/");
      if (res.data && res.data.success) {
        const mappedItems = (res.data.items || []).map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
          subtotal: item.subtotal || item.product.price * item.quantity,
        }));
        set({ items: mappedItems });
        get().recalculate();
      }
    } catch (err) {
      console.error("Failed to load cart from server:", err);
    } finally {
      set({ loading: false });
    }
  },

  syncCartWithServer: async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("guest_cart");
        if (savedCart) {
          const localItems = JSON.parse(savedCart) as CartItem[];
          for (const item of localItems) {
            await api.post("/cart/items/", {
              product: item.product.id,
              quantity: item.quantity,
            });
          }
          localStorage.removeItem("guest_cart");
        }
        await get().fetchCart();
      } catch (err) {
        console.error("Error syncing cart with server:", err);
      }
    }
  },

  addItem: async (product, quantity = 1) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      try {
        const res = await api.post("/cart/items/", {
          product: product.id,
          quantity,
        });
        if (res.data && res.data.success) {
          await get().fetchCart();
        }
      } catch (err) {
        console.error("Failed to add item to server cart:", err);
      }
    } else {
      const items = get().items;
      const existingItemIndex = items.findIndex(
        (item) => item.product.id === product.id,
      );
      let newItems = [...items];

      if (existingItemIndex > -1) {
        const newQty = newItems[existingItemIndex].quantity + quantity;
        newItems[existingItemIndex] = {
          product,
          quantity: newQty,
          subtotal: product.price * newQty,
        };
      } else {
        newItems.push({
          product,
          quantity,
          subtotal: product.price * quantity,
        });
      }

      set({ items: newItems });
      get().recalculate();

      if (typeof window !== "undefined") {
        localStorage.setItem("guest_cart", JSON.stringify(newItems));
      }
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(productId);
      return;
    }

    const token = useAuthStore.getState().accessToken;
    if (token) {
      try {
        const res = await api.put(`/cart/items/${productId}/`, { quantity });
        if (res.data && res.data.success) {
          await get().fetchCart();
        }
      } catch (err) {
        console.error("Failed to update server cart quantity:", err);
      }
    } else {
      const items = get().items;
      const newItems = items.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity,
            subtotal: item.product.price * quantity,
          };
        }
        return item;
      });

      set({ items: newItems });
      get().recalculate();

      if (typeof window !== "undefined") {
        localStorage.setItem("guest_cart", JSON.stringify(newItems));
      }
    }
  },

  removeItem: async (productId) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      try {
        const res = await api.delete(`/cart/items/${productId}/`);
        if (res.data && res.data.success) {
          await get().fetchCart();
        }
      } catch (err) {
        console.error("Failed to remove item from server cart:", err);
      }
    } else {
      const items = get().items;
      const newItems = items.filter((item) => item.product.id !== productId);

      set({ items: newItems });
      get().recalculate();

      if (typeof window !== "undefined") {
        localStorage.setItem("guest_cart", JSON.stringify(newItems));
      }
    }
  },

  clearCart: async () => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      try {
        const res = await api.delete("/cart/");
        if (res.data && res.data.success) {
          set({ items: [] });
          get().recalculate();
        }
      } catch (err) {
        console.error("Failed to clear server cart:", err);
      }
    } else {
      set({ items: [] });
      get().recalculate();
      if (typeof window !== "undefined") {
        localStorage.setItem("guest_cart", JSON.stringify([]));
      }
    }
  },
}));
