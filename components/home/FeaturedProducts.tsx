import { getFeaturedProducts } from "@/lib/services/productService";
import FeaturedProductsClient from "./FeaturedProductsClient";

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (!products.length) {
    return null;
  }

  return <FeaturedProductsClient products={products} />;
}