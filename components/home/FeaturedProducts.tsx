import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { getProducts } from "@/lib/services/productService"

export default async function FeaturedProducts() {
  const products = await getProducts()

  return (
    <section className="py-12">
      <div className="container">

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Products</h2>

          <Link href="/shop" className="text-sm text-primaryRed hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">

          {products.map((product) => {
            const variant = product.variants?.[0]

            return (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-lg border bg-white hover:shadow-lg transition"
              >

                {/* IMAGE */}
                <div className="relative">
                  <Link href={`/product/${product.slug}`}>
                    <Image
                      src={product.images?.[0]?.url || "/placeholder.png"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="p-4 object-cover"
                    />
                  </Link>
                </div>

                {/* INFO */}
                <div className="p-4 flex flex-col gap-2">

                  <p className="text-xs text-gray-500">
                    {product.brand?.name}
                  </p>

                  <h3 className="text-sm font-medium">
                    {product.name}
                  </h3>

                  {/* PRICE */}
                  <div className="flex justify-between items-center">
                    <p className="font-bold">
                      ${variant?.price || 0}
                    </p>

                    <button className="p-2 bg-primaryRed text-white rounded-lg">
                      <ShoppingCart size={16} />
                    </button>
                  </div>

                </div>
              </div>
            )
          })}

        </div>
      </div>
    </section>
  )
}