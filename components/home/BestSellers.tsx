import { getBestSellingProducts } from "@/lib/services/productService";
import BestSellerProductsClient from "./BestSellerProductsClient";

export default async function BestSellerProducts() {
  const products = await getBestSellingProducts();

  if (!products.length) {
    return null;
  }

  return <BestSellerProductsClient products={products} />;
}