"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

export default function ProductsClient({
  products,
  brands,
  categories,
  page,
  total,
  limit,
}: any) {
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [brandFilter, setBrandFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)


  // ======================
  // FILTER
  // ======================
  const filtered = products.filter((p: any) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchBrand =
      brandFilter === "all" || p.brand?.id === brandFilter

    const matchCategory =
      categoryFilter === "all" || p.category?.id === categoryFilter

    return matchSearch && matchBrand && matchCategory
  })

  // ======================
  // DELETE
  // ======================
  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      toast.success("Product deleted")
      router.refresh()
    }

    setDeleteId(null)
  }

  const totalPages = Math.ceil(total / limit)

  function changePage(newPage: number) {
    router.push(`/admin/products?page=${newPage}`)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Products
          </h1>
          <p className="text-sm text-gray-500">
            Total Products:{" "}
            <span className="font-semibold">{total}</span>
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800"
        >
          + Add Product
        </Link>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-lg border mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Brands</option>
          {brands.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Categories</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

      </div>

      {/* LIST */}
      <div className="space-y-3">

        {filtered.map((product: any) => {
          const variants = product.variants || []
          const totalStock = variants.reduce(
            (sum: number, v: any) => sum + (v.stock || 0),
            0
          )

          const minPrice = variants.length
            ? Math.min(...variants.map((v: any) => v.price))
            : 0

          const isVariable = variants.length > 0

          const mainImage = product.images?.find(
            (img: any) => img.type === "main"
          )

          console.log("Images:", product.images)

          return (
            <div
              key={product.id}
              className="bg-white border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition"
            >

              {/* LEFT */}
              <div className="flex items-center gap-4">

              {/* IMAGE PLACEHOLDER */}
              {mainImage ? (
                <img
                  src={mainImage.url}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                  No Image
                </div>
              )}

                <div>

                  <h2 className="font-semibold text-gray-900">
                    {product.name}
                  </h2>

                  <div className="flex gap-2 mt-1 flex-wrap text-xs">

                    <span className="px-2 py-0.5 bg-gray-100 rounded">
                      {product.brand?.name || "No Brand"}
                    </span>

                    <span className="px-2 py-0.5 bg-gray-100 rounded">
                      {product.category?.name || "No Category"}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded ${
                        isVariable
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {isVariable
                        ? "Variable"
                        : "Simple"}
                    </span>

                  </div>
                </div>
              </div>

              {/* MIDDLE */}
              <div className="text-sm text-gray-600 text-center">

                {isVariable ? (
                  <>
                    <div className="font-semibold text-gray-900">
                      ${minPrice}+
                    </div>
                    <div className="text-xs text-gray-400">
                      {variants.length} variants
                    </div>
                  </>
                ) : (
                  <div className="font-semibold text-gray-900">
                    Single Product
                  </div>
                )}

              </div>

              {/* RIGHT */}
              <div className="text-right text-sm">

                <div className="font-semibold">
                  Stock: {totalStock}
                </div>

                <div className="text-xs text-gray-400">
                  Updated recently
                </div>

              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 ml-6">

                <Link
                  href={`/admin/products/${product.id}`}
                  className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  View
                </Link>

                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  Edit
                </Link>

                <button
                  onClick={() => setDeleteId(product.id)}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500"
                >
                  Delete
                </button>

              </div>

            </div>
          )
        })}

      </div>

      {/* PAGINATION */}
      <div className="flex gap-2 mt-8 justify-center">

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => changePage(i + 1)}
            className={`px-3 py-1 rounded border text-sm ${
              page === i + 1
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            {i + 1}
          </button>
        ))}

      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-[320px]">

            <h2 className="text-lg font-bold mb-2">
              Delete Product?
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteId)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}