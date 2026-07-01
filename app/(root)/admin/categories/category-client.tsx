"use client"

import { useState } from "react"
import slugify from "slugify"
import { toast } from "react-toastify"
import { uploadImage } from "@/lib/cloudinary/uploadImage"

type Category = {
  id: string
  name: string
  slug?: string | null
  image?: string | null
  sortOrder: number
}

function generateSlug(value: string) {
  return slugify(value || "", {
    lower: true,
    strict: true,
  })
}

function sortCategories(categories: Category[]) {
  return [...categories].sort((a, b) => {
    const orderA = a.sortOrder ?? 0
    const orderB = b.sortOrder ?? 0

    if (orderA !== orderB) {
      return orderA - orderB
    }

    return a.name.localeCompare(b.name)
  })
}

export default function CategoryClient({
  categories,
}: {
  categories: Category[]
}) {
  const [list, setList] = useState<Category[]>(sortCategories(categories))

  const [name, setName] = useState("")
  const [image, setImage] = useState<string>("")
  const [sortOrder, setSortOrder] = useState("0")

  const [uploadingImage, setUploadingImage] = useState(false)
  const [creating, setCreating] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState("")
  const [editImage, setEditImage] = useState("")
  const [editSortOrder, setEditSortOrder] = useState("0")

  const [uploadingEditImage, setUploadingEditImage] = useState(false)
  const [updating, setUpdating] = useState(false)

  const createSlug = generateSlug(name)
  const editSlug = generateSlug(editName)

  // =========================
  // UPLOAD CATEGORY IMAGE
  // =========================
  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)

      const uploaded = await uploadImage(file)

      setImage(uploaded.url)

      toast.success("Category image uploaded")
    } catch {
      toast.error("Category image upload failed")
    } finally {
      setUploadingImage(false)
    }
  }

  // =========================
  // UPLOAD EDIT CATEGORY IMAGE
  // =========================
  async function handleEditImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingEditImage(true)

      const uploaded = await uploadImage(file)

      setEditImage(uploaded.url)

      toast.success("Category image uploaded")
    } catch {
      toast.error("Category image upload failed")
    } finally {
      setUploadingEditImage(false)
    }
  }

  // =========================
  // CREATE CATEGORY
  // =========================
  async function createCategory() {
    if (!name.trim()) {
      toast.error("Category name is required")
      return
    }

    if (!createSlug) {
      toast.error("Valid category slug is required")
      return
    }

    try {
      setCreating(true)

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: createSlug,
          image: image || null,
          sortOrder: Number(sortOrder || 0),
        }),
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        setList((prev) => sortCategories([data, ...prev]))

        setName("")
        setImage("")
        setSortOrder("0")

        toast.success("Category created")
      } else {
        toast.error(data?.message || "Failed to create category")
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
  function openEditModal(category: Category) {
    setEditCategory(category)
    setEditName(category.name)
    setEditImage(category.image || "")
    setEditSortOrder(String(category.sortOrder ?? 0))
  }

  // =========================
  // CLOSE EDIT MODAL
  // =========================
  function closeEditModal() {
    setEditCategory(null)
    setEditName("")
    setEditImage("")
    setEditSortOrder("0")
  }

  // =========================
  // UPDATE CATEGORY
  // =========================
  async function updateCategory() {
    if (!editCategory) return

    if (!editName.trim()) {
      toast.error("Category name is required")
      return
    }

    if (!editSlug) {
      toast.error("Valid category slug is required")
      return
    }

    try {
      setUpdating(true)

      const res = await fetch(`/api/admin/categories/${editCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          image: editImage || null,
          sortOrder: Number(editSortOrder || 0),
        }),
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        setList((prev) =>
          sortCategories(
            prev.map((category) =>
              category.id === data.id ? data : category
            )
          )
        )

        toast.success("Category updated")
        closeEditModal()
      } else {
        toast.error(data?.message || "Failed to update category")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setUpdating(false)
    }
  }

  // =========================
  // CONFIRM DELETE CATEGORY
  // =========================
  async function confirmDelete() {
    if (!deleteId) return

    const res = await fetch(`/api/admin/categories/${deleteId}`, {
      method: "DELETE",
    })

    const data = await res.json().catch(() => null)

    if (res.ok) {
      setList((prev) => prev.filter((category) => category.id !== deleteId))

      toast.success("Category deleted")
      setDeleteId(null)
    } else {
      toast.error(data?.message || "Failed to delete category")
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-4">
        Categories
      </h1>

      {/* CREATE SECTION */}
      <div className="mb-6 rounded-xl border bg-white p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
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
            placeholder="category-slug"
            className="border p-2 w-full rounded bg-gray-100 text-gray-500"
          />

          <p className="mt-1 text-xs text-gray-500">
            Slug is generated automatically from category name.
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
            Category Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />

          {uploadingImage && (
            <p className="mt-2 text-sm text-gray-500">
              Uploading image...
            </p>
          )}

          {image && (
            <div className="mt-4 flex items-center gap-4">
              <img
                src={image}
                alt={name || "Category image"}
                className="h-16 w-16 rounded-lg border object-contain bg-white p-2"
              />

              <button
                type="button"
                onClick={() => setImage("")}
                className="text-sm text-red-600 hover:underline"
              >
                Remove image
              </button>
            </div>
          )}
        </div>

        <button
          onClick={createCategory}
          disabled={creating || uploadingImage}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {creating ? "Adding..." : "Add Category"}
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {list.map((category) => (
          <div
            key={category.id}
            className="flex justify-between items-center border p-3 rounded bg-white"
          >
            <div className="flex items-center gap-3">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-10 w-10 rounded border object-contain bg-white p-1"
                />
              ) : (
                <div className="h-10 w-10 rounded border bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  No
                </div>
              )}

              <div>
                <span className="font-medium block">
                  {category.name}
                </span>

                <span className="text-xs text-gray-500 block">
                  Slug: {category.slug || generateSlug(category.name) || "No slug"}
                </span>

                <span className="text-xs text-gray-500 block">
                  Sort Order: {category.sortOrder ?? 0}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => openEditModal(category)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>

              <button
                onClick={() => setDeleteId(category.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[420px] max-w-[92vw] shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              Edit Category
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>

                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Category name"
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
                  placeholder="category-slug"
                  className="border p-2 w-full rounded bg-gray-100 text-gray-500"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Slug updates automatically when category name changes.
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
                  Category Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageUpload}
                />

                {uploadingEditImage && (
                  <p className="mt-2 text-sm text-gray-500">
                    Uploading image...
                  </p>
                )}

                {editImage && (
                  <div className="mt-4 flex items-center gap-4">
                    <img
                      src={editImage}
                      alt={editName || "Category image"}
                      className="h-16 w-16 rounded-lg border object-contain bg-white p-2"
                    />

                    <button
                      type="button"
                      onClick={() => setEditImage("")}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove image
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
                onClick={updateCategory}
                disabled={updating || uploadingEditImage}
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
              Are you sure you want to delete this category?
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