import { prisma } from "@/lib/prisma"
import Link from "next/link"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      images: true,
      variants: true,
    },
  })

  if (!product) {
    return (
      <div className="p-6 text-red-500">
        Product not found
      </div>
    )
  }

  const isVariable = product.variants && product.variants.length > 0
  const mainImage = product.images.find((img) => img.type === "main")
  const galleryImages = product.images.filter(
    (img) => img.type === "gallery"
  )

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            {product.name}
          </h1>

          <p className="text-gray-500">
            {product.slug}
          </p>
        </div>

        <div className="flex gap-2">

          <Link
            href={`/admin/products/edit/${product.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded"
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

      {/* ================= INFO CARD ================= */}
      <div className="bg-white border rounded p-4 mb-6">

        <p>
          <strong>Brand:</strong>{" "}
          {product.brand?.name || "No Brand"}
        </p>

        <p>
          <strong>Category:</strong>{" "}
          {product.category?.name || "No Category"}
        </p>

        <p>
          <strong>Type:</strong>{" "}
          {isVariable ? "Variable Product" : "Simple Product"}
        </p>

        {!isVariable && (
          <p>
            <strong>Price:</strong> ${product.price || 0}
          </p>
        )}

      </div>

      {/* ================= IMAGES ================= */}
      <div className="mb-6">

        <h2 className="text-xl font-bold mb-3">
          Images
        </h2>

        {/* MAIN IMAGE */}
        {mainImage && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">
              Main Image
            </h3>

            <img
              src={mainImage.url}
              className="w-40 h-40 object-cover rounded border"
            />
          </div>
        )}

        {/* GALLERY */}
        {galleryImages.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">
              Gallery Images
            </h3>

            <div className="flex gap-2 flex-wrap">
              {galleryImages.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  className="w-24 h-24 object-cover rounded border"
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= VARIANTS ================= */}
      {isVariable ? (
        <div>

          <h2 className="text-xl font-bold mb-3">
            Variants
          </h2>

          <div className="grid gap-3">

            {product.variants.map((v) => (
              <div
                key={v.id}
                className="border rounded p-3 flex justify-between bg-white"
              >

                <div>
                  <p className="font-semibold">
                    Storage: {v.storage}
                  </p>

                  {v.color && (
                    <p className="text-sm text-gray-500">
                      Color: {v.color}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-bold">
                    ${v.price}
                  </p>

                  <p className="text-sm text-gray-500">
                    Stock: {v.stock}
                  </p>
                </div>

              </div>
            ))}

          </div>

        </div>
      ) : (
        <div className="bg-white border rounded p-4">

          <h2 className="text-xl font-bold mb-2">
            Product Details
          </h2>

          <p>
            <strong>Price:</strong> ${product.price || 0}
          </p>

          <p>
            <strong>Stock:</strong> {product.stock || 0}
          </p>

        </div>
      )}

    </div>
  )
}