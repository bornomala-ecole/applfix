"use client"

import { useState } from "react"
import slugify from "slugify"
import { toast } from "react-toastify"
import { uploadImage } from "@/lib/cloudinary/uploadImage"

type Brand = {
  id: string
  name: string
  slug?: string | null
  logo?: string | null
  sortOrder: number
}

function generateSlug(value: string) {
  return slugify(value || "", {
    lower: true,
    strict: true,
  })
}

function sortBrands(brands: Brand[]) {
  return [...brands].sort((a, b) => {
    const orderA = a.sortOrder ?? 0
    const orderB = b.sortOrder ?? 0

    if (orderA !== orderB) {
      return orderA - orderB
    }

    return a.name.localeCompare(b.name)
  })
}

export default function BrandClient({ brands }: { brands: Brand[] }) {
  const [list, setList] = useState<Brand[]>(sortBrands(brands))

  const [name, setName] = useState("")
  const [logo, setLogo] = useState<string>("")
  const [sortOrder, setSortOrder] = useState("0")

  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [creating, setCreating] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [editBrand, setEditBrand] = useState<Brand | null>(null)
  const [editName, setEditName] = useState("")
  const [editLogo, setEditLogo] = useState("")
  const [editSortOrder, setEditSortOrder] = useState("0")

  const [uploadingEditLogo, setUploadingEditLogo] = useState(false)
  const [updating, setUpdating] = useState(false)

  const createSlug = generateSlug(name)
  const editSlug = generateSlug(editName)

  // =========================
  // UPLOAD BRAND LOGO
  // =========================
  async function handleLogoUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingLogo(true)

      const uploaded = await uploadImage(file)

      setLogo(uploaded.url)

      toast.success("Brand logo uploaded")
    } catch {
      toast.error("Brand logo upload failed")
    } finally {
      setUploadingLogo(false)
    }
  }

  // =========================
  // UPLOAD EDIT BRAND LOGO
  // =========================
  async function handleEditLogoUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingEditLogo(true)

      const uploaded = await uploadImage(file)

      setEditLogo(uploaded.url)

      toast.success("Brand logo uploaded")
    } catch {
      toast.error("Brand logo upload failed")
    } finally {
      setUploadingEditLogo(false)
    }
  }

  // =========================
  // CREATE BRAND
  // =========================
  async function createBrand() {
    if (!name.trim()) {
      toast.error("Brand name is required")
      return
    }

    if (!createSlug) {
      toast.error("Valid brand slug is required")
      return
    }

    try {
      setCreating(true)

      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: createSlug,
          logo: logo || null,
          sortOrder: Number(sortOrder || 0),
        }),
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        setList((prev) => sortBrands([data, ...prev]))

        setName("")
        setLogo("")
        setSortOrder("0")

        toast.success("Brand created")
      } else {
        toast.error(data?.message || "Failed to create brand")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setCreating(false)
    }
  }

  // =========================
  // OPEN EDIT MODAL
  // =========================
  function openEditModal(brand: Brand) {
    setEditBrand(brand)
    setEditName(brand.name)
    setEditLogo(brand.logo || "")
    setEditSortOrder(String(brand.sortOrder ?? 0))
  }

  // =========================
  // CLOSE EDIT MODAL
  // =========================
  function closeEditModal() {
    setEditBrand(null)
    setEditName("")
    setEditLogo("")
    setEditSortOrder("0")
  }

  // =========================
  // UPDATE BRAND
  // =========================
  async function updateBrand() {
    if (!editBrand) return

    if (!editName.trim()) {
      toast.error("Brand name is required")
      return
    }

    if (!editSlug) {
      toast.error("Valid brand slug is required")
      return
    }

    try {
      setUpdating(true)

      const res = await fetch(`/api/admin/brands/${editBrand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          logo: editLogo || null,
          sortOrder: Number(editSortOrder || 0),
        }),
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        setList((prev) =>
          sortBrands(
            prev.map((brand) =>
              brand.id === data.id ? data : brand
            )
          )
        )

        toast.success("Brand updated")
        closeEditModal()
      } else {
        toast.error(data?.message || "Failed to update brand")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setUpdating(false)
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
      setList((prev) => prev.filter((b) => b.id !== deleteId))

      toast.success("Brand deleted")
      setDeleteId(null)
    } else {
      toast.error("Failed to delete brand")
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-4">
        Brands
      </h1>

      {/* CREATE SECTION */}
      <div className="mb-6 rounded-xl border bg-white p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Brand name"
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>

          <input
            value={createSlug}
            readOnly
            placeholder="brand-slug"
            className="border p-2 w-full rounded bg-gray-100 text-gray-500"
          />

          <p className="mt-1 text-xs text-gray-500">
            Slug is generated automatically from brand name.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort Order
          </label>

          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="0"
            className="border p-2 w-full rounded"
          />

          <p className="mt-1 text-xs text-gray-500">
            Lower number will show first on frontend.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand Logo
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />

          {uploadingLogo && (
            <p className="mt-2 text-sm text-gray-500">
              Uploading logo...
            </p>
          )}

          {logo && (
            <div className="mt-4 flex items-center gap-4">
              <img
                src={logo}
                alt={name || "Brand logo"}
                className="h-16 w-16 rounded-lg border object-contain bg-white p-2"
              />

              <button
                type="button"
                onClick={() => setLogo("")}
                className="text-sm text-red-600 hover:underline"
              >
                Remove logo
              </button>
            </div>
          )}
        </div>

        <button
          onClick={createBrand}
          disabled={creating || uploadingLogo}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {creating ? "Adding..." : "Add Brand"}
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {list.map((b) => (
          <div
            key={b.id}
            className="flex justify-between items-center border p-3 rounded bg-white"
          >
            <div className="flex items-center gap-3">
              {b.logo ? (
                <img
                  src={b.logo}
                  alt={b.name}
                  className="h-10 w-10 rounded border object-contain bg-white p-1"
                />
              ) : (
                <div className="h-10 w-10 rounded border bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  No
                </div>
              )}

              <div>
                <span className="font-medium block">
                  {b.name}
                </span>

                <span className="text-xs text-gray-500 block">
                  Slug: {b.slug || generateSlug(b.name) || "No slug"}
                </span>

                <span className="text-xs text-gray-500 block">
                  Sort Order: {b.sortOrder ?? 0}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => openEditModal(b)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>

              <button
                onClick={() => setDeleteId(b.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[420px] max-w-[92vw] shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              Edit Brand
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name
                </label>

                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Brand name"
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>

                <input
                  value={editSlug}
                  readOnly
                  placeholder="brand-slug"
                  className="border p-2 w-full rounded bg-gray-100 text-gray-500"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Slug updates automatically when brand name changes.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>

                <input
                  type="number"
                  value={editSortOrder}
                  onChange={(e) => setEditSortOrder(e.target.value)}
                  placeholder="0"
                  className="border p-2 w-full rounded"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Lower number will show first on frontend.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Logo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditLogoUpload}
                />

                {uploadingEditLogo && (
                  <p className="mt-2 text-sm text-gray-500">
                    Uploading logo...
                  </p>
                )}

                {editLogo && (
                  <div className="mt-4 flex items-center gap-4">
                    <img
                      src={editLogo}
                      alt={editName || "Brand logo"}
                      className="h-16 w-16 rounded-lg border object-contain bg-white p-2"
                    />

                    <button
                      type="button"
                      onClick={() => setEditLogo("")}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove logo
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closeEditModal}
                disabled={updating}
                className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={updateBrand}
                disabled={updating || uploadingEditLogo}
                className="px-3 py-2 bg-black text-white rounded disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
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