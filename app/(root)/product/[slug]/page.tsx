import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductOptions from "@/components/product/ProductOptions";
import { productDetailData } from "@/lib/data/ProductDetails";
import { DetailedProduct } from "@/lib/types/shop";
import ProductView from "@/components/shop/ProductView"; // Reuse for related products

// This would be a real fetch in a production app
const getProductBySlug = async (slug: string): Promise<DetailedProduct | null> => {
  return productDetailData[slug] || null;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return { title: `${product.name} - YourStore` };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  // console.log("slug:", slug);
  if (!product) {
    notFound();
  }

  // In a real app, you would fetch related products based on brand or category
  const relatedProducts = Object.values(productDetailData).filter(p => p.id !== product.id && p.brand === product.brand);

  return (
    <div className="container py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-8">
        {/* Left Column: Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Right Column: Info, Options, and Add to Cart */}
        <div className="mt-8 lg:mt-0">
          <ProductInfo product={product} currentPrice={product.price} />
          {/* <ProductOptions
            product={product}
            selectedColor={product.variants.color[0].name}
            selectedStorage={product.variants.storage[0].size}
            onColorChange={() => {}} // Placeholder
            onStorageChange={() => {}} // Placeholder
          /> */}
          <ProductOptions
            product={product}
            initialColor={product.variants.color[0].name}
            initialStorage={product.variants.storage[0].size}
          />

          
          {/* Add to Cart Form (Simplified for this example) */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button className="flex-1 rounded-lg bg-primaryRed px-8 py-3 font-semibold text-white transition-colors hover:bg-red-700">
              Add to Cart
            </button>
            <button className="flex-1 rounded-lg border border-gray-300 px-8 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-100">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section (Description, Specs, Reviews) */}
      <section className="mt-16">
        {/* TODO: Implement a tabbed component here for Description, Specs, and Reviews */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button className="py-4 text-sm font-medium text-primaryRed border-b-2 border-primaryRed">Description</button>
            <button className="py-4 text-sm font-medium text-gray-500 hover:text-gray-700">Specifications</button>
            <button className="py-4 text-sm font-medium text-gray-500 hover:text-gray-700">Reviews</button>
          </nav>
        </div>
        <div className="mt-6">
          <p>{product.description}</p>
        </div>
      </section>

      {/* Related Products */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-8">Related Products</h2>
        <ProductView products={relatedProducts} viewMode="grid" />
      </section>
    </div>
  );
}