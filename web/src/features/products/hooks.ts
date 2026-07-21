import useProductsStore from "./store";

export function useProducts() {
  const products = useProductsStore((s: any) => s.products);
  const loading = useProductsStore((s: any) => s.loading);
  const error = useProductsStore((s: any) => s.error);
  const fetchProducts = useProductsStore((s: any) => s.fetchProducts);

  return { products, loading, error, fetchProducts };
}

export default useProducts;
