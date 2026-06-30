"use client";

import { useEffect, useMemo, useState } from "react";
import slugify from "slugify";
import { uploadImage } from "@/lib/cloudinary/uploadImage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Variant = {
  sku: string;
  title: string;
  color: string;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
};

type ImageType = {
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

export default function NewProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [series, setSeries] = useState<Series[]>([]);

  const [images, setImages] = useState<ImageType[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [weightGrams, setWeightGrams] = useState("");

  const [brandId, setBrandId] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [bestSelling, setBestSelling] = useState(false);

  const [variants, setVariants] = useState<Variant[]>([
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
  ]);

  const filteredSeries = useMemo(() => {
    if (!brandId) return [];
    return series.filter((item) => item.brandId === brandId);
  }, [brandId, series]);

  useEffect(() => {
    fetch("/api/admin/products/form-data")
      .then((res) => res.json())
      .then((data) => {
        setBrands(data.brands || []);
        setCategories(data.categories || []);
        setSeries(data.series || []);
      })
      .catch(() => {
        toast.error("Failed to load form data");
      });
  }, []);

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

  const mainImage = images.find((img) => img.type === "main");
  const galleryImages = images.filter((img) => img.type === "gallery");

  async function handleMainImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadImage(file);

      setImages((prev) => [
        ...prev.filter((img) => img.type !== "main"),
        {
          url: uploaded.url,
          publicId: uploaded.publicId,
          alt: name,
          type: "main",
          sortOrder: 0,
        },
      ]);

      toast.success("Main image uploaded");
    } catch {
      toast.error("Main image upload failed");
    }
  }

  async function handleGalleryUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    try {
      const currentGalleryCount = galleryImages.length;

      const uploadedImages: ImageType[] = await Promise.all(
        files.map(async (file, index) => {
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

      toast.success("Gallery images uploaded");
    } catch {
      toast.error("Gallery upload failed");
    }
  }

  async function handleDeleteImage(img: ImageType) {
    try {
      if (img.publicId) {
        await fetch("/api/admin/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: img.publicId }),
        });
      }

      setImages((prev) =>
        prev.filter((item) => {
          if (img.publicId) {
            return item.publicId !== img.publicId;
          }

          return item.url !== img.url;
        })
      );

      toast.success("Image deleted");
    } catch {
      toast.error("Failed to delete image");
    }
  }

  function updateImageAlt(url: string, alt: string) {
    setImages((prev) =>
      prev.map((img) =>
        img.url === url
          ? {
              ...img,
              alt,
            }
          : img
      )
    );
  }

  function updateImageSortOrder(url: string, sortOrder: number) {
    setImages((prev) =>
      prev.map((img) =>
        img.url === url
          ? {
              ...img,
              sortOrder,
            }
          : img
      )
    );
  }

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

  function removeVariant(index: number) {
    if (variants.length === 1) {
      toast.error("At least one variant is required");
      return;
    }

    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariant<K extends keyof Variant>(
    index: number,
    key: K,
    value: Variant[K]
  ) {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [key]: value,
      };
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        !variant.title.trim() ||
        variant.price < 0 ||
        variant.stock < 0 ||
        variant.lowStockThreshold < 0
    );

    if (invalidVariant) {
      toast.error(
        "Each variant needs title, valid price, stock, and low stock alert."
      );
      return;
    }

    const grams =
      weightGrams.trim() === "" ? null : Number(weightGrams.trim());

    if (grams !== null && (!Number.isFinite(grams) || grams < 0)) {
      toast.error("Weight must be a valid number in grams.");
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

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    const data = await res.json().catch(() => null);

    if (res.ok) {
      toast.success("Product created successfully");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(data?.message || "Error creating product");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>

          <p className="mt-1 text-sm text-gray-500">
            Add product details, images, variants, pricing, status, and SEO.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFO */}
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
                  placeholder="Product name"
                  className="w-full rounded border p-2"
                  required
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
                  placeholder="Short summary for product cards"
                  className="min-h-[80px] w-full rounded border p-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full product description"
                  className="min-h-[140px] w-full rounded border p-2"
                />
              </div>
            </div>
          </div>

          {/* STATUS */}
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
                    Product will be visible in shop.
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
                  <p className="font-medium text-gray-900">
                    Featured Product
                  </p>
                  <p className="text-xs text-gray-500">
                    Product will appear in featured sections.
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
                    Product will appear in best-selling sections.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* BRAND / SERIES / CATEGORY */}
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

          {/* SEO */}
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
                  placeholder="SEO title"
                  className="w-full rounded border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Meta Description
                </label>

                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO meta description"
                  className="min-h-[90px] w-full rounded border p-2"
                />
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

          {/* IMAGES */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Images</h2>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Main Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
              />

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

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryUpload}
              />

              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                {galleryImages.map((image, index) => (
                  <div key={`${image.url}-${index}`} className="rounded-xl border p-3">
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

          {/* VARIANTS */}
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
                <div key={index} className="rounded-xl border p-4">
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
                        placeholder="iphone-15-128gb-black"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(index, "sku", e.target.value)
                        }
                        className="w-full rounded border p-2"
                      />

                      <p className="mt-1 text-[11px] text-gray-400">
                        Leave empty to auto-generate.
                      </p>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Variant Title
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
                        Stock Quantity
                      </label>

                      <input
                        type="number"
                        placeholder="10"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(index, "stock", Number(e.target.value))
                        }
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Selling Price
                      </label>

                      <input
                        type="number"
                        placeholder="999"
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
                        placeholder="Old price / regular price"
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
                        placeholder="Purchase cost"
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

                      <p className="mt-1 text-[11px] text-gray-400">
                        Alert when stock reaches this number.
                      </p>
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

          <button
            disabled={loading}
            className="w-full rounded-lg bg-black p-3 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}