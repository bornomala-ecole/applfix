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
  // FILTER LOGIC
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

  // ======================
  // PAGINATION
  // ======================
  const totalPages = Math.ceil(total / limit)

  function changePage(newPage: number) {
    router.push(`/admin/products?page=${newPage}`)
  }

  return (
    <div className="p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500">
            Total: {total}
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Product
        </Link>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 mb-4">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 w-full rounded"
        />

        {/* BRAND FILTER */}
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

        {/* CATEGORY FILTER */}
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
      <div className="grid gap-4">

        {filtered.map((product: any) => (
          <div
            key={product.id}
            className="p-4 border rounded bg-white flex justify-between items-center"
          >

            <div>
              <h2 className="font-semibold">
                {product.name}
              </h2>
              <p className="text-sm text-gray-500">
                {product.brand?.name}
              </p>
            </div>

            <div className="text-sm text-gray-600">
              {product.variants.length} variants
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">

              <Link
                href={`/admin/products/${product.id}`}
                className="px-3 py-1 text-sm bg-gray-700 text-white rounded"
              >
                View
              </Link>

              <Link
                href={`/admin/products/edit/${product.id}`}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
              >
                Edit
              </Link>

              <button
                onClick={() => setDeleteId(product.id)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded"
              >
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* PAGINATION */}
      <div className="flex gap-2 mt-6 justify-center">

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => changePage(i + 1)}
            className={`px-3 py-1 border rounded ${
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white p-6 rounded w-[300px]">

            <h2 className="text-lg font-bold mb-2">
              Confirm Delete
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this product?
            </p>

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-1 bg-gray-300 rounded"
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