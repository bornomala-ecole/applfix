"use client"

import { useState } from "react"
import { toast } from "react-toastify"

export default function BrandClient({ brands }: any) {
  const [list, setList] = useState(brands)
  const [name, setName] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // =========================
  // CREATE BRAND
  // =========================
  async function createBrand() {
    if (!name.trim()) return

    const res = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    if (res.ok) {
      const newBrand = await res.json()
      setList((prev: any) => [newBrand, ...prev])
      setName("")
      toast.success("Brand created")
    }
  }

  // =========================
  // CONFIRM DELETE BRAND
  // =========================
  async function confirmDelete() {
    if (!deleteId) return

    const res = await fetch(`/api/admin/brands/${deleteId}`, {
      method: "DELETE",
    })

    if (res.ok) {
      setList((prev: any) =>
        prev.filter((b: any) => b.id !== deleteId)
      )

      toast.success("Brand deleted")
      setDeleteId(null)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-4">
        Brands
      </h1>

      {/* CREATE SECTION */}
      <div className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Brand name"
          className="border p-2 flex-1 rounded"
        />

        <button
          onClick={createBrand}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {list.map((b: any) => (
          <div
            key={b.id}
            className="flex justify-between items-center border p-3 rounded"
          >
            <span className="font-medium">
              {b.name}
            </span>

            <button
              onClick={() => setDeleteId(b.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* =========================
          DELETE CONFIRM MODAL
      ========================= */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-lg w-[320px] shadow-lg">

            <h2 className="text-lg font-bold mb-2">
              Confirm Delete
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete this brand?
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
                onClick={confirmDelete}
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