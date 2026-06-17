"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import slugify from "slugify"
import { uploadImage } from "@/lib/cloudinary/uploadImage"

type Variant = {
  id?: string
  storage: string
  price: number
  stock: number
}

export default function EditProductClient({
  product,
  brands,
  categories,
}: any) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(product.name)
  const [slug, setSlug] = useState(product.slug)
  const [description, setDescription] = useState(product.description || "")

  const [brandId, setBrandId] = useState(product.brandId)
  const [categoryId, setCategoryId] = useState(product.categoryId)

  const [images, setImages] = useState(product.images || [])
  const [variants, setVariants] = useState<Variant[]>(product.variants || [])

  // AUTO SLUG
  useEffect(() => {
    setSlug(slugify(name, { lower: true, strict: true }))
  }, [name])

  // IMAGE UPLOAD
  async function handleImageUpload(e: any) {
    const file = e.target.files?.[0]
    if (!file) return

    const uploaded = await uploadImage(file)
    setImages((prev:any) => [...prev, uploaded])
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { storage: "", price: 0, stock: 0 },
    ])
  }

  function updateVariant(index: number, key: keyof Variant, value: any) {
    setVariants((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  // UPDATE PRODUCT
  async function handleUpdate(e: any) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      name,
      slug,
      description,
      brandId,
      categoryId,
      images,
      variants,
    }

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    setLoading(false)

    if (res.ok) {
      router.push("/admin/products")
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Edit Product
      </h1>

      <form onSubmit={handleUpdate} className="flex flex-col gap-4">

        {/* NAME */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />

        {/* SLUG */}
        <input
          value={slug}
          readOnly
          className="border p-2 rounded bg-gray-100"
        />

        {/* DESCRIPTION */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
        />

        {/* BRAND */}
        <select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="border p-2 rounded"
        >
          {brands.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* CATEGORY */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border p-2 rounded"
        >
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* IMAGES */}
        <input type="file" onChange={handleImageUpload} />

        <div className="flex gap-2 flex-wrap">
          {images.map((img: any, i: number) => (
            <img
              key={i}
              src={img.url}
              className="w-20 h-20 object-cover rounded"
            />
          ))}
        </div>

        {/* VARIANTS */}
        <div>
          <h2 className="font-bold mt-4">Variants</h2>

          {variants.map((v, i) => (
            <div key={i} className="flex gap-2 mt-2">

              <input
                value={v.storage}
                onChange={(e) =>
                  updateVariant(i, "storage", e.target.value)
                }
                className="border p-2 rounded"
              />

              <input
                type="number"
                value={v.price}
                onChange={(e) =>
                  updateVariant(i, "price", Number(e.target.value))
                }
                className="border p-2 rounded"
              />

              <input
                type="number"
                value={v.stock}
                onChange={(e) =>
                  updateVariant(i, "stock", Number(e.target.value))
                }
                className="border p-2 rounded"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addVariant}
            className="text-blue-600 mt-2"
          >
            + Add Variant
          </button>
        </div>

        {/* SUBMIT */}
        <button
          disabled={loading}
          className="bg-black text-white p-3 rounded mt-4"
        >
          {loading ? "Updating..." : "Update Product"}
        </button>

      </form>
    </div>
  )
}