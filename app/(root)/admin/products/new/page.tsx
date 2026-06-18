"use client"

import { useEffect, useState } from "react"
import slugify from "slugify"
import { uploadImage } from "@/lib/cloudinary/uploadImage"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

type Variant = {
  title: string
  color: string
  price: number
  stock: number
}

type ImageType = {
  url: string
  publicId?: string
  type: "main" | "gallery"
}

export default function NewProductPage() {
  const [loading, setLoading] = useState(false)

  const [images, setImages] = useState<ImageType[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

  const [variants, setVariants] = useState<Variant[]>([
    {
      title: "Default",
      color: "",
      price: 0,
      stock: 0,
    },
  ])

  const router = useRouter()

  // ======================
  // LOAD DATA
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
  // SLUG
  // ======================
  useEffect(() => {
    setSlug(slugify(name, { lower: true, strict: true }))
  }, [name])

  // ======================
  // MAIN IMAGE UPLOAD
  // ======================
  async function handleMainImageUpload(e: any) {
    const file = e.target.files?.[0]
    if (!file) return

    const uploaded = await uploadImage(file)

    setImages((prev) => {
      const filtered = prev.filter((img) => img.type !== "main")

      return [
        ...filtered,
        {
          url: uploaded.url,
          publicId: uploaded.publicId,
          type: "main" as const,
        },
      ]
    })
  }

  // ======================
  // GALLERY UPLOAD
  // ======================
  async function handleGalleryUpload(e: any) {
    const files = Array.from(e.target.files as FileList)

    const uploadedImages = await Promise.all(
      files.map(async (file: File) => {
        const uploaded = await uploadImage(file)

        return {
          url: uploaded.url,
          publicId: uploaded.publicId,
          type: "gallery" as const,
        }
      })
    )

    setImages((prev) => [...prev, ...uploadedImages])
  }

  // ======================
  // DELETE IMAGE (CLOUDINARY + STATE)
  // ======================
  async function handleDeleteImage(img: ImageType) {
    try {
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
    } catch (err) {
      toast.error("Failed to delete image")
    }
  }

  // ======================
  // VARIANTS
  // ======================
  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        title: "",
        color: "",
        price: 0,
        stock: 0,
      },
    ])
  }

  function updateVariant(index: number, key: keyof Variant, value: any) {
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
      brandId: form.get("brandId")?.toString() || null,
      categoryId: form.get("categoryId")?.toString() || null,
      images,
      variants,
    }

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    setLoading(false)

    if (res.ok) {
      toast.success("Product created successfully")

      e.target.reset()
      setImages([])
      setVariants([
        {
          title: "Default",
          color: "",
          price: 0,
          stock: 0,
        },
      ])
      setName("")
      setSlug("")
      router.push("/admin/products")
    } else {
      toast.error("Error creating product")
    }
  }

  const mainImage = images.find((img) => img.type === "main")

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

        {/* SLUG */}
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

        {/* BRAND */}
        <select name="brandId" className="border p-2 rounded">
          <option value="">Select Brand</option>
          {brands.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* CATEGORY */}
        <select name="categoryId" className="border p-2 rounded">
          <option value="">Select Category</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* ================= MAIN IMAGE ================= */}
        <div className="border p-3 rounded">
          <h3 className="font-semibold mb-2">Main Image</h3>

          <input type="file" onChange={handleMainImageUpload} />

          {mainImage && (
            <div className="relative w-24 h-24 mt-2">
              <img
                src={mainImage.url}
                className="w-24 h-24 object-cover rounded"
              />

              <button
                type="button"
                onClick={() => handleDeleteImage(mainImage)}
                className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* ================= GALLERY ================= */}
        <div className="border p-3 rounded mt-4">
          <h3 className="font-semibold mb-2">Gallery Images</h3>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleGalleryUpload}
          />

          <div className="flex gap-2 flex-wrap mt-2">
            {images
              .filter((img) => img.type === "gallery")
              .map((img, index) => (
                <div key={index} className="relative w-20 h-20">

                  <img
                    src={img.url}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs"
                  >
                    ×
                  </button>

                </div>
              ))}
          </div>
        </div>



        {/* VARIANTS */}
        <div>
          <h2 className="font-bold mt-4">Variants</h2>

          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mt-2">

              <input
                placeholder="Title"
                value={v.title}
                onChange={(e) =>
                  updateVariant(i, "title", e.target.value)
                }
                className="border p-2 rounded"
              />

              <input
                placeholder="Color"
                value={v.color}
                onChange={(e) =>
                  updateVariant(i, "color", e.target.value)
                }
                className="border p-2 rounded"
              />

              <input
                type="number"
                placeholder="Price"
                value={v.price}
                onChange={(e) =>
                  updateVariant(i, "price", Number(e.target.value))
                }
                className="border p-2 rounded"
              />

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