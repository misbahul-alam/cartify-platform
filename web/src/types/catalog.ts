export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id?: string;
  status: "public" | "private";
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  public_id: string;
  is_primary: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id?: string;
  category?: Category;
  images: ProductImage[];
  is_stock: boolean;
  is_featured: boolean;
  status: "active" | "inactive" | "draft";
  created_at: string;
}
