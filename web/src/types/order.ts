export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_price: number;
  shipping_address: string;
  status: "pending" | "processing" | "paid" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  updated_at: string;
}
