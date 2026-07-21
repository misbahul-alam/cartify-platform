import type { Product } from "./catalog";

export interface CartItem {
  product_id: string;
  product?: Product;
  quantity: number;
}

export interface Cart {
  user_id: string;
  items: Array<{
    product: Product;
    quantity: number;
    subtotal: number;
  }>;
  total_price: number;
}
