"use client"

import { useEffect, useState } from "react"
import slugify from "slugify"
import { uploadImage } from "@/lib/cloudinary/uploadImage"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

type Variant = {
  storage: string
  price: number
  stock: number
}

export default function NewProductPage() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

  const router = useRouter()

  const [variants, setVariants] = useState<Variant[]>([
    { storage: "128GB", price: 0, stock: 0 },
  ])

  // ======================
  // LOAD BRANDS/CATEGORIES
  // ======================
  useEffect(() => {
    fetch("/api/admin/form-data")
      .then((res) => res.json())
      .then((data) => {
        setBrands(data.brands)
        setCategories(data.categories)
      })
  }, [])

  // ======================
  // AUTO SLUG GENERATION
  // ======================
  useEffect(() => {
    setSlug(slugify(name, { lower: true, strict: true }))
  }, [name])

  // ======================
  // IMAGE UPLOAD
  // ======================
  async function handleImageUpload(e: any) {
    const file = e.target.files?.[0]
    if (!file) return

    const uploaded = await uploadImage(file)
    setImages((prev) => [...prev, uploaded])
  }

  // ======================
  // VARIANTS
  // ======================
  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { storage: "", price: 0, stock: 0 },
    ])
  }

  function updateVariant(
    index: number,
    key: keyof Variant,
    value: string | number
  ) {
    setVariants((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  // ======================
  // SUBMIT
  // ======================
  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.target)

    const payload = {
      name,
      slug,
      description: form.get("description"),
      brandId: form.get("brandId"),
      categoryId: form.get("categoryId"),
      images,
      variants,
    }

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      toast.success("Product created successfully")
  
      // ✅ RESET EVERYTHING
      e.target.reset()
      setImages([])
      setVariants([{ storage: "128GB", price: 0, stock: 0 }])
      setName("")
      setSlug("")
      router.push("/admin/products")
    } else {
      toast.error("Error creating product")
    }

    setLoading(false)
    
    
  }

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Create Product
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* NAME */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
          className="border p-2 rounded"
          required
        />

        {/* SLUG PREVIEW */}
        <input
          value={slug}
          readOnly
          className="border p-2 rounded bg-gray-100"
        />

        {/* DESCRIPTION */}
        <textarea
          name="description"
          placeholder="Description"
          className="border p-2 rounded"
        />

        {/* BRAND DROPDOWN */}
        <select name="brandId" className="border p-2 rounded">
          <option value="">Select Brand</option>
          {brands.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* CATEGORY DROPDOWN */}
        <select name="categoryId" className="border p-2 rounded">
          <option value="">Select Category</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* IMAGE UPLOAD */}
        <input type="file" onChange={handleImageUpload} />

        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
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
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Storage</label>
                <input
                  placeholder="Storage"
                  value={v.storage}
                  onChange={(e) =>
                    updateVariant(i, "storage", e.target.value)
                  }
                  className="border p-2 rounded"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Price</label>
                <input
                  type="number"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) =>
                    updateVariant(i, "price", Number(e.target.value))
                  }
                  className="border p-2 rounded"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Stock</label>
                <input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) =>
                    updateVariant(i, "stock", Number(e.target.value))
                  }
                  className="border p-2 rounded"
                />
              </div>
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
          className="bg-black text-white p-3 mt-4 rounded"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>

      </form>
    </div>
  )
}