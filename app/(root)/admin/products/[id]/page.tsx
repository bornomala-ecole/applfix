import { prisma } from "@/lib/prisma"
import Link from "next/link"

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({ params }: Props) {

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id},
    include: {
      brand: true,
      category: true,
      images: true,
      variants: true,
    },
  })

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          {product.name}
        </h1>

        <div className="flex gap-2">

          <Link
            href={`/admin/products/edit/${product.id}`}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Edit Product
          </Link>

          <Link
            href="/admin/products"
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Back
          </Link>

        </div>

      </div>

      {/* INFO SECTION */}
      <div className="bg-white border rounded p-4 mb-4">

        <p><strong>Brand:</strong> {product.brand?.name}</p>
        <p><strong>Category:</strong> {product.category?.name}</p>
        <p><strong>Slug:</strong> {product.slug}</p>

      </div>

      {/* IMAGES */}
      <div className="mb-6">
        <h2 className="font-bold mb-2">Images</h2>

        <div className="flex gap-2 flex-wrap">
          {product.images.map((img) => (
            <img
              key={img.id}
              src={img.url}
              className="w-24 h-24 object-cover rounded border"
            />
          ))}
        </div>
      </div>

      {/* VARIANTS */}
      <div>
        <h2 className="font-bold mb-2">Variants</h2>

        <div className="grid gap-2">
          {product.variants.map((v) => (
            <div
              key={v.id}
              className="border p-3 rounded flex justify-between"
            >
              <span>{v.storage}</span>
              <span>${v.price}</span>
              <span>Stock: {v.stock}</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}