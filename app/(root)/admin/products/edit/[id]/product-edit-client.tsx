"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import slugify from "slugify"
import { uploadImage } from "@/lib/cloudinary/uploadImage"
import { toast } from "react-toastify"

type Variant = {
  storage: string
  price: number
  stock: number
}

type ImageType = {
  url: string
  publicId?: string
  type: "main" | "gallery"
}

export default function EditProductClient({
  product,
  brands,
  categories,
}: any) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // ================= BASIC INFO =================
  const [name, setName] = useState(product.name)
  const [slug, setSlug] = useState(product.slug)
  const [description, setDescription] = useState(product.description || "")

  const [price, setPrice] = useState(product.price || 0)
  const [stock, setStock] = useState(product.stock || 0)

  const [brandId, setBrandId] = useState(product.brandId || "")
  const [categoryId, setCategoryId] = useState(product.categoryId || "")
  const [isActive, setIsActive] = useState(product.isActive ?? true)

  // ================= TYPE =================
  const [productType, setProductType] = useState<"simple" | "variable">(
    product.variants?.length > 0 ? "variable" : "simple"
  )

  const [variants, setVariants] = useState<Variant[]>(
    product.variants || []
  )

  const [images, setImages] = useState<ImageType[]>(
    product.images || []
  )

  // ================= SLUG =================
  useEffect(() => {
    setSlug(slugify(name, { lower: true, strict: true }))
  }, [name])

  const mainImage = images.find((img) => img.type === "main")

  // ================= IMAGE UPLOAD =================
  async function handleMainUpload(e: any) {
    const file = e.target.files?.[0]
    if (!file) return

    const uploaded = await uploadImage(file)

    setImages((prev) => [
      ...prev.filter((img) => img.type !== "main"),
      {
        url: uploaded.url,
        publicId: uploaded.publicId,
        type: "main",
      },
    ])
  }

  async function handleGalleryUpload(e: any) {
    const files = Array.from(e.target.files || []) as File[]

    const uploadedImages: ImageType[] = await Promise.all(
      files.map(async (file: File): Promise<ImageType> => {
        const uploaded = await uploadImage(file)

        return {
          url: uploaded.url,
          publicId: uploaded.publicId,
          type: "gallery",
        }
      })
    )

    setImages((prev) => [...prev, ...uploadedImages])
  }

  async function handleDeleteImage(img: ImageType) {
    if (img.publicId) {
      await fetch("/api/admin/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: img.publicId }),
      })
    }

    setImages((prev) =>
      prev.filter((i) => i.publicId !== img.publicId)
    )

    toast.success("Image deleted")
  }

  // ================= VARIANTS =================
  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { storage: "", price: 0, stock: 0 },
    ])
  }

  function updateVariant(index: number, key: keyof Variant, value: any) {
    setVariants((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [key]: value }
      return copy
    })
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  // ================= UPDATE =================
  async function handleUpdate(e: any) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      name,
      slug,
      description,
      price,
      stock,
      brandId,
      categoryId,
      isActive,
      images,
      variants: productType === "variable" ? variants : [],
    }

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    setLoading(false)

    if (res.ok) {
      toast.success("Product updated successfully")
      router.push("/admin/products")
    } else {
      toast.error("Update failed")
    }
  }

  // ================= UI =================
  return (
    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Edit Product
      </h1>

      <form onSubmit={handleUpdate} className="space-y-6">

        {/* ================= BASIC INFO ================= */}
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-4">Basic Information</h2>

          <label>Product Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 w-full mb-3" />

          <label>Slug</label>
          <input value={slug} readOnly className="border p-2 w-full bg-gray-100 mb-3" />

          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 w-full" />
        </div>

        {/* ================= STATUS ================= */}
        <div className="border p-4 rounded">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active Product
          </label>
        </div>

        {/* ================= PRICING ================= */}
        {productType === "simple" && (
          <div className="border p-4 rounded">
            <h2 className="font-bold mb-4">Pricing</h2>

            <label>Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="border p-2 w-full mb-3" />

            <label>Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="border p-2 w-full" />
          </div>
        )}

        {/* ================= BRAND / CATEGORY ================= */}
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-4">Brand & Category</h2>

          <label>Brand</label>
          <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="border p-2 w-full mb-3">
            <option value="">Select Brand</option>
            {brands.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <label>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="border p-2 w-full">
            <option value="">Select Category</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* ================= IMAGES ================= */}
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-4">Images</h2>

          <label>Main Image</label>
          <input type="file" onChange={handleMainUpload} />

          {mainImage && (
            <div className="relative w-24 h-24 mt-2">
              <img src={mainImage.url} className="w-24 h-24 object-cover rounded" />
              <button type="button" onClick={() => handleDeleteImage(mainImage)} className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded">
                ×
              </button>
            </div>
          )}

          <label className="block mt-4">Gallery Images</label>
          <input type="file" multiple onChange={handleGalleryUpload} />

          <div className="flex gap-2 mt-2 flex-wrap">
            {images.filter(i => i.type === "gallery").map((img, i) => (
              <div key={i} className="relative w-20 h-20">
                <img src={img.url} className="w-20 h-20 object-cover rounded" />
                <button type="button" onClick={() => handleDeleteImage(img)} className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================= VARIANTS ================= */}
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-4">Variants</h2>

          <select value={productType} onChange={(e) => setProductType(e.target.value as any)} className="border p-2 w-full mb-3">
            <option value="simple">Simple</option>
            <option value="variable">Variable</option>
          </select>

          {productType === "variable" && (
            <>
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={v.storage} onChange={(e) => updateVariant(i, "storage", e.target.value)} className="border p-2" />
                  <input type="number" value={v.price} onChange={(e) => updateVariant(i, "price", Number(e.target.value))} className="border p-2" />
                  <input type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", Number(e.target.value))} className="border p-2" />
                  <button type="button" onClick={() => removeVariant(i)} className="text-red-500">X</button>
                </div>
              ))}

              <button type="button" onClick={addVariant} className="text-blue-600">
                + Add Variant
              </button>
            </>
          )}
        </div>

        {/* ================= SUBMIT ================= */}
        <button disabled={loading} className="bg-black text-white p-3 w-full">
          {loading ? "Updating..." : "Update Product"}
        </button>

      </form>
    </div>
  )
}