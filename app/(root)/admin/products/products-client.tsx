"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "react-toastify"

export default function ProductsClient({ products }: any) {
  const [search, setSearch] = useState("")
  const [list, setList] = useState(products)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  // ======================
  // SEARCH FILTER
  // ======================
  const filtered = list.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  // ======================
  // DELETE PRODUCT
  // ======================
  async function handleDelete() {
    if (!deleteId) return

    const res = await fetch(`/api/admin/products/${deleteId}`, {
      method: "DELETE",
    })

    

    if(res.ok){
      setList((prev: any) =>
        prev.filter((p: any) => p.id !== deleteId)
      )
      setDeleteId(null)

      toast.success("Product deleted successfully!")
    }

    
  }

  return (
    <div className="p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500">
            Total: {list.length}
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Product
        </Link>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />

      {/* LIST */}
      <div className="grid gap-4">

        {filtered.map((product: any) => (
          <div
            key={product.id}
            className="p-4 border rounded bg-white flex justify-between items-center"
          >

            <div>
              <h2 className="font-semibold">{product.name}</h2>
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

      {/* ======================
          DELETE MODAL
      ====================== */}
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
                onClick={handleDelete}
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