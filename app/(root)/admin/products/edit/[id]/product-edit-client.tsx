"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { uploadImage } from "@/lib/cloudinary/uploadImage";
import { toast } from "react-toastify";

type Variant = {
  id?: string;
  sku: string;
  title: string;
  color: string;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
};

type ImageType = {
  id?: string;
  url: string;
  publicId?: string | null;
  alt?: string | null;
  type: "main" | "gallery";
  sortOrder: number;
};

type Brand = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
};

type Series = {
  id: string;
  name: string;
  brandId: string;
};

type Props = {
  product: any;
  brands: Brand[];
  categories: Category[];
  series: Series[];
};

export default function EditProductClient({
  product,
  brands,
  categories,
  series,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // ================= BASIC INFO =================
  const [name, setName] = useState(product.name || "");
  const [slug, setSlug] = useState(product.slug || "");
  const [description, setDescription] = useState(product.description || "");
  const [shortDescription, setShortDescription] = useState(
    product.shortDescription || ""
  );

  // ================= SEO INFO =================
  const [metaTitle, setMetaTitle] = useState(product.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    product.metaDescription || ""
  );
  const [weightGrams, setWeightGrams] = useState(
    product.weightGrams?.toString() || ""
  );

  // ================= RELATIONS / STATUS =================
  const [brandId, setBrandId] = useState(product.brandId ?? "");
  const [categoryId, setCategoryId] = useState(product.categoryId ?? "");
  const [seriesId, setSeriesId] = useState(product.seriesId ?? "");

  const [isActive, setIsActive] = useState(product.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured ?? false);
  const [bestSelling, setBestSelling] = useState(product.bestSelling ?? false);

  // ================= VARIANTS =================
  const [variants, setVariants] = useState<Variant[]>(
    product.variants?.length
      ? product.variants.map((variant: any) => ({
          id: variant.id,
          sku: variant.sku ?? "",
          title: variant.title ?? "",
          color: variant.color ?? "",
          price: variant.price ?? 0,
          comparePrice: variant.comparePrice ?? null,
          costPrice: variant.costPrice ?? null,
          stock: variant.stock ?? 0,
          lowStockThreshold: variant.lowStockThreshold ?? 5,
          isActive: variant.isActive ?? true,
        }))
      : [
          {
            sku: "",
            title: "Default",
            color: "",
            price: 0,
            comparePrice: null,
            costPrice: null,
            stock: 0,
            lowStockThreshold: 5,
            isActive: true,
          },
        ]
  );

  // ================= IMAGES =================
  const [images, setImages] = useState<ImageType[]>(
    product.images?.map((image: any, index: number) => ({
      id: image.id,
      url: image.url ?? "",
      publicId: image.publicId ?? null,
      alt: image.alt ?? "",
      type: image.type ?? "gallery",
      sortOrder: image.sortOrder ?? index,
    })) || []
  );

  // ================= SLUG =================
  useEffect(() => {
    setSlug(slugify(name, { lower: true, strict: true }));
  }, [name]);

  useEffect(() => {
    if (!seriesId) return;

    const selectedSeries = series.find((item) => item.id === seriesId);

    if (selectedSeries && selectedSeries.brandId !== brandId) {
      setSeriesId("");
    }
  }, [brandId, seriesId, series]);

  const mainImage = images.find((image) => image.type === "main");
  const galleryImages = images.filter((image) => image.type === "gallery");

  const filteredSeries = useMemo(() => {
    if (!brandId) return [];

    return series.filter((item) => item.brandId === brandId);
  }, [brandId, series]);

  // ================= IMAGE UPLOAD =================
  async function handleMainUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const uploaded = await uploadImage(file);

      setImages((prev) => [
        ...prev.filter((image) => image.type !== "main"),
        {
          url: uploaded.url,
          publicId: uploaded.publicId,
          alt: name,
          type: "main",
          sortOrder: 0,
        },
      ]);

      toast.success("Main image uploaded");
    } catch (error) {
      toast.error("Main image upload failed");
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []) as File[];

    if (!files.length) return;

    try {
      const currentGalleryCount = galleryImages.length;

      const uploadedImages: ImageType[] = await Promise.all(
        files.map(async (file: File, index: number) => {
          const uploaded = await uploadImage(file);

          return {
            url: uploaded.url,
            publicId: uploaded.publicId,
            alt: `${name} gallery image`,
            type: "gallery",
            sortOrder: currentGalleryCount + index + 1,
          };
        })
      );

      setImages((prev) => [...prev, ...uploadedImages]);

      toast.success("Gallery image uploaded");
    } catch (error) {
      toast.error("Gallery image upload failed");
    }
  }

  async function handleDeleteImage(image: ImageType) {
    try {
      if (image.publicId) {
        await fetch("/api/admin/delete-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicId: image.publicId,
          }),
        });
      }

      setImages((prev) =>
        prev.filter((item) => {
          if (image.id) {
            return item.id !== image.id;
          }

          return item.url !== image.url;
        })
      );

      toast.success("Image removed");
    } catch (error) {
      toast.error("Failed to remove image");
    }
  }

  function updateImageSortOrder(url: string, sortOrder: number) {
    setImages((prev) =>
      prev.map((image) =>
        image.url === url
          ? {
              ...image,
              sortOrder,
            }
          : image
      )
    );
  }

  function updateImageAlt(url: string, alt: string) {
    setImages((prev) =>
      prev.map((image) =>
        image.url === url
          ? {
              ...image,
              alt,
            }
          : image
      )
    );
  }

  // ================= VARIANTS =================
  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        sku: "",
        title: "",
        color: "",
        price: 0,
        comparePrice: null,
        costPrice: null,
        stock: 0,
        lowStockThreshold: 5,
        isActive: true,
      },
    ]);
  }

  function updateVariant<K extends keyof Variant>(
    index: number,
    key: K,
    value: Variant[K]
  ) {
    setVariants((prev) => {
      const copy = [...prev];

      copy[index] = {
        ...copy[index],
        [key]: value,
      };

      return copy;
    });
  }

  function removeVariant(index: number) {
    if (variants.length === 1) {
      toast.error("At least one variant is required");
      return;
    }

    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  // ================= UPDATE =================
  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!variants.length) {
      toast.error("At least one variant is required");
      return;
    }

    const invalidVariant = variants.find(
      (variant) =>
        !variant.sku.trim() ||
        !variant.title.trim() ||
        variant.price < 0 ||
        variant.stock < 0
    );

    if (invalidVariant) {
      toast.error("Each variant needs SKU, title, valid price, and valid stock");
      return;
    }

    const grams =
      weightGrams.trim() === "" ? null : parseInt(weightGrams.trim(), 10);
    
    if (grams !== null && (!Number.isFinite(grams) || grams < 0)) {
      toast.error("Weight must be a valid whole number in grams");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      slug,
      description,
      shortDescription,
      metaTitle,
      metaDescription,
      weightGrams: grams,
      brandId,
      categoryId,
      seriesId,
      isActive,
      isFeatured,
      bestSelling,
      images,
      variants,
    };

    console.log("Payload:", payload)

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    const data = await res.json();

    if (res.ok) {
      toast.success("Product updated successfully");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(data.message || "Update failed");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>

          <p className="mt-1 text-sm text-gray-500">
            Update product details, images, variants, pricing, SEO, and shipping weight.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* ================= BASIC INFO ================= */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Product Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border p-2"
                  placeholder="Product name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Slug
                </label>

                <input
                  value={slug}
                  readOnly
                  className="w-full rounded border bg-gray-100 p-2 text-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Short Description
                </label>

                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="min-h-[80px] w-full rounded border p-2"
                  placeholder="Short summary for cards and product highlights"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[140px] w-full rounded border p-2"
                  placeholder="Full product description"
                />
              </div>
            </div>
          </div>

          {/* ================= STATUS ================= */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Product Status
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />

                <div>
                  <p className="font-medium text-gray-900">Active Product</p>
                  <p className="text-xs text-gray-500">
                    Product will be visible in shop and product pages.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />

                <div>
                  <p className="font-medium text-gray-900">Featured Product</p>
                  <p className="text-xs text-gray-500">
                    Product will appear in homepage featured section.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                <input
                  type="checkbox"
                  checked={bestSelling}
                  onChange={(e) => setBestSelling(e.target.checked)}
                />

                <div>
                  <p className="font-medium text-gray-900">
                    Best Selling Product
                  </p>
                  <p className="text-xs text-gray-500">
                    Product will appear in best-selling product sections.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ================= BRAND / CATEGORY ================= */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Brand, Series & Category
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Brand
                </label>

                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full rounded border p-2"
                >
                  <option value="">Select Brand</option>

                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Series
                </label>

                <select
                  value={seriesId}
                  onChange={(e) => setSeriesId(e.target.value)}
                  disabled={!brandId}
                  className="w-full rounded border p-2 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">
                    {brandId ? "Select Series" : "Select brand first"}
                  </option>

                  {filteredSeries.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <p className="mt-1 text-xs text-gray-500">
                  Series list will change based on selected brand.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded border p-2"
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ================= SEO ================= */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              SEO Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Meta Title
                </label>

                <input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full rounded border p-2"
                  placeholder="SEO title"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Recommended length: around 50–60 characters.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Meta Description
                </label>

                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="min-h-[90px] w-full rounded border p-2"
                  placeholder="SEO meta description"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Recommended length: around 140–160 characters.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Weight (grams)
                </label>

                <input
                  type="number"
                  min={0}
                  step="1"
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(e.target.value)}
                  placeholder="Example: 250"
                  className="w-full rounded border p-2"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Used later for shipping charge calculation.
                </p>
              </div>
            </div>
          </div>

          {/* ================= IMAGES ================= */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Images</h2>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Main Image
              </label>

              <input type="file" onChange={handleMainUpload} />

              {mainImage && (
                <div className="mt-4 max-w-sm rounded-xl border p-4">
                  <div className="relative h-28 w-28">
                    <img
                      src={mainImage.url}
                      alt={mainImage.alt || name}
                      className="h-28 w-28 rounded border object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => handleDeleteImage(mainImage)}
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-600 text-white"
                    >
                      ×
                    </button>
                  </div>

                  <input
                    value={mainImage.alt || ""}
                    onChange={(e) =>
                      updateImageAlt(mainImage.url, e.target.value)
                    }
                    placeholder="Alt text"
                    className="mt-3 w-full rounded border p-2 text-sm"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Gallery Images
              </label>

              <input type="file" multiple onChange={handleGalleryUpload} />

              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                {galleryImages.map((image, index) => (
                  <div
                    key={`${image.url}-${index}`}
                    className="rounded-xl border p-3"
                  >
                    <div className="relative aspect-square w-full">
                      <img
                        src={image.url}
                        alt={image.alt || name}
                        className="h-full w-full rounded border object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image)}
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-600 text-white"
                      >
                        ×
                      </button>
                    </div>

                    <input
                      value={image.alt || ""}
                      onChange={(e) =>
                        updateImageAlt(image.url, e.target.value)
                      }
                      placeholder="Alt text"
                      className="mt-2 w-full rounded border p-2 text-xs"
                    />

                    <input
                      type="number"
                      value={image.sortOrder}
                      onChange={(e) =>
                        updateImageSortOrder(image.url, Number(e.target.value))
                      }
                      placeholder="Sort order"
                      className="mt-2 w-full rounded border p-2 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= VARIANTS ================= */}
          <div className="rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Variants</h2>

              <button
                type="button"
                onClick={addVariant}
                className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={variant.id || index}
                  className="rounded-xl border p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Variant #{index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-sm text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        SKU
                      </label>

                      <input
                        placeholder="SKU"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(index, "sku", e.target.value)
                        }
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Title
                      </label>

                      <input
                        placeholder="128GB"
                        value={variant.title}
                        onChange={(e) =>
                          updateVariant(index, "title", e.target.value)
                        }
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Color
                      </label>

                      <input
                        placeholder="Black"
                        value={variant.color}
                        onChange={(e) =>
                          updateVariant(index, "color", e.target.value)
                        }
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Stock
                      </label>

                      <input
                        type="number"
                        placeholder="Stock"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(index, "stock", Number(e.target.value))
                        }
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Price
                      </label>

                      <input
                        type="number"
                        placeholder="Price"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(index, "price", Number(e.target.value))
                        }
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Compare Price
                      </label>

                      <input
                        type="number"
                        placeholder="Old price"
                        value={variant.comparePrice ?? ""}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "comparePrice",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Cost Price
                      </label>

                      <input
                        type="number"
                        placeholder="Cost price"
                        value={variant.costPrice ?? ""}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "costPrice",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Low Stock Alert
                      </label>

                      <input
                        type="number"
                        placeholder="5"
                        value={variant.lowStockThreshold}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "lowStockThreshold",
                            Number(e.target.value)
                          )
                        }
                        className="w-full rounded border p-2"
                      />
                    </div>
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={variant.isActive}
                      onChange={(e) =>
                        updateVariant(index, "isActive", e.target.checked)
                      }
                    />

                    Active Variant
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* ================= SUBMIT ================= */}
          <button
            disabled={loading}
            className="w-full rounded-lg bg-black p-3 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}