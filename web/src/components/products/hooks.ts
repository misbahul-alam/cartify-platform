import { useProductsStore } from "@/store/useProductsStore";

export function useProducts() {
  const { products, loading, error, fetchProducts } = useProductsStore();

  return { products, loading, error, fetchProducts };
}

export default useProducts;
