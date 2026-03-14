"use client";

import { useActionState, useMemo, useState } from "react";
import { createProductAction } from "@/actions/product-actions";
import { deleteCloudinaryImageAction } from "@/actions/cloudinary-actions";
import CloudinaryUploader from "./CloudinaryUploader";

type ImageItem = {
  url: string;
  public_id: string;
  alt?: string;
};

type OptionDefinition = {
  name: string;
  values: string[];
};

type VariantRow = {
  sku: string;
  price: number | "";
  stock: number | "";
  image?: ImageItem;
  options: Record<string, string>;
};

type SpecificationRow = {
  label: string;
  value: string;
};

const initialState = {
  success: false,
  message: "",
};

function makeSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProductCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createProductAction,
    initialState
  );

  const [productName, setProductName] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [brand, setBrand] = useState("");

  const [hasVariants, setHasVariants] = useState(true);
  const [isDeletingMainImage, setIsDeletingMainImage] = useState(false);
  const [deletingGalleryIndex, setDeletingGalleryIndex] = useState<number | null>(
    null
  );
  const [deletingVariantImageIndex, setDeletingVariantImageIndex] = useState<
    number | null
  >(null);

  const [mainImage, setMainImage] = useState<ImageItem>({
    url: "",
    public_id: "",
    alt: "",
  });

  const [galleryImages, setGalleryImages] = useState<ImageItem[]>([]);

  const [optionDefinitions, setOptionDefinitions] = useState<OptionDefinition[]>([
    { name: "color", values: [""] },
    { name: "storage", values: [""] },
  ]);

  const [variants, setVariants] = useState<VariantRow[]>([
    {
      sku: "",
      price: "",
      stock: "",
      options: {
        color: "",
        storage: "",
      },
    },
  ]);

  const [specifications, setSpecifications] = useState<SpecificationRow[]>([
    { label: "", value: "" },
  ]);

  const resolvedSlug = useMemo(() => {
    return makeSlug(productSlug || productName || "temp-product");
  }, [productSlug, productName]);

  const resolvedBrand = useMemo(() => {
    return makeSlug(brand || "general");
  }, [brand]);

  const uploadFolderBase = `products/${resolvedBrand}/${resolvedSlug}`;

  const addGalleryImage = () => {
    setGalleryImages((prev) => [...prev, { url: "", public_id: "", alt: "" }]);
  };

  const updateGalleryImage = (
    index: number,
    field: keyof ImageItem,
    value: string
  ) => {
    setGalleryImages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeGalleryImage = async (index: number) => {
    const image = galleryImages[index];

    if (image?.public_id) {
      setDeletingGalleryIndex(index);

      const result = await deleteCloudinaryImageAction(image.public_id);

      setDeletingGalleryIndex(null);

      if (!result.success) {
        alert(result.message || "Failed to delete image from Cloudinary.");
        return;
      }
    }

    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeMainImage = async () => {
    if (mainImage?.public_id) {
      setIsDeletingMainImage(true);

      const result = await deleteCloudinaryImageAction(mainImage.public_id);

      setIsDeletingMainImage(false);

      if (!result.success) {
        alert(result.message || "Failed to delete main image.");
        return;
      }
    }

    setMainImage({
      url: "",
      public_id: "",
      alt: "",
    });
  };

  const addOptionDefinition = () => {
    setOptionDefinitions((prev) => [...prev, { name: "", values: [""] }]);
  };

  const updateOptionDefinitionName = (index: number, value: string) => {
    const trimmed = value.toLowerCase();
    setOptionDefinitions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name: trimmed } : item))
    );
  };

  const addOptionValue = (index: number) => {
    setOptionDefinitions((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, values: [...item.values, ""] } : item
      )
    );
  };

  const updateOptionValue = (
    optionIndex: number,
    valueIndex: number,
    value: string
  ) => {
    setOptionDefinitions((prev) =>
      prev.map((item, i) =>
        i === optionIndex
          ? {
              ...item,
              values: item.values.map((v, vi) => (vi === valueIndex ? value : v)),
            }
          : item
      )
    );
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    setOptionDefinitions((prev) =>
      prev.map((item, i) =>
        i === optionIndex
          ? {
              ...item,
              values: item.values.filter((_, vi) => vi !== valueIndex),
            }
          : item
      )
    );
  };

  const removeOptionDefinition = (index: number) => {
    setOptionDefinitions((prev) => prev.filter((_, i) => i !== index));
  };

  const optionNames = useMemo(
    () => optionDefinitions.map((item) => item.name.trim()).filter(Boolean),
    [optionDefinitions]
  );

  const addVariant = () => {
    const newOptions: Record<string, string> = {};
    optionNames.forEach((name) => {
      newOptions[name] = "";
    });

    setVariants((prev) => [
      ...prev,
      {
        sku: "",
        price: "",
        stock: "",
        options: newOptions,
      },
    ]);
  };

  const updateVariantField = (
    index: number,
    field: "sku" | "price" | "stock",
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "price" || field === "stock"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const updateVariantOption = (
    index: number,
    optionName: string,
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              options: {
                ...item.options,
                [optionName]: value,
              },
            }
          : item
      )
    );
  };

  const updateVariantImage = (
    index: number,
    field: keyof ImageItem,
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              image: {
                url: item.image?.url || "",
                public_id: item.image?.public_id || "",
                alt: item.image?.alt || "",
                [field]: value,
              },
            }
          : item
      )
    );
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVariantImage = async (index: number) => {
    const image = variants[index]?.image;

    if (image?.public_id) {
      setDeletingVariantImageIndex(index);

      const result = await deleteCloudinaryImageAction(image.public_id);

      setDeletingVariantImageIndex(null);

      if (!result.success) {
        alert(result.message || "Failed to delete variant image.");
        return;
      }
    }

    setVariants((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, image: undefined } : item
      )
    );
  };

  const addSpecification = () => {
    setSpecifications((prev) => [...prev, { label: "", value: "" }]);
  };

  const updateSpecification = (
    index: number,
    field: keyof SpecificationRow,
    value: string
  ) => {
    setSpecifications((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const cleanedOptionDefinitions = optionDefinitions
    .map((item) => ({
      name: item.name.trim().toLowerCase(),
      values: item.values.map((v) => v.trim()).filter(Boolean),
    }))
    .filter((item) => item.name && item.values.length > 0);

  const cleanedVariants = variants
    .map((item) => ({
      sku: item.sku.trim(),
      price: item.price === "" ? 0 : item.price,
      stock: item.stock === "" ? 0 : item.stock,
      image:
        item.image?.url && item.image?.public_id
          ? {
              url: item.image.url.trim(),
              public_id: item.image.public_id.trim(),
              alt: item.image.alt?.trim() || "",
            }
          : undefined,
      options: Object.fromEntries(
        Object.entries(item.options).map(([key, val]) => [key, val.trim()])
      ),
    }))
    .filter((item) => item.sku);

  const cleanedSpecifications = specifications
    .map((item) => ({
      label: item.label.trim(),
      value: item.value.trim(),
    }))
    .filter((item) => item.label && item.value);

  const cleanedGalleryImages = galleryImages
    .map((item) => ({
      url: item.url.trim(),
      public_id: item.public_id.trim(),
      alt: item.alt?.trim() || "",
    }))
    .filter((item) => item.url && item.public_id);

  return (
    <form action={formAction} className="space-y-8 rounded-xl border p-6">
      <div>
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload folder: {uploadFolderBase}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Product Name</label>
          <input
            name="name"
            className="w-full rounded-lg border px-4 py-2"
            placeholder="iPhone 16 Pro"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Slug</label>
          <input
            name="slug"
            className="w-full rounded-lg border px-4 py-2"
            placeholder="iphone-16-pro"
            value={productSlug}
            onChange={(e) => setProductSlug(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Brand</label>
          <input
            name="brand"
            className="w-full rounded-lg border px-4 py-2"
            placeholder="Apple"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <input
            name="category"
            className="w-full rounded-lg border px-4 py-2"
            placeholder="Smartphones"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Short Description
        </label>
        <textarea
          name="shortDescription"
          className="w-full rounded-lg border px-4 py-2"
          rows={2}
          placeholder="Short summary of the product"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <textarea
          name="description"
          className="w-full rounded-lg border px-4 py-2"
          rows={5}
          placeholder="Write full product description"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Tags (comma separated)
        </label>
        <input
          name="tagsInput"
          className="w-full rounded-lg border px-4 py-2"
          placeholder="iphone, apple, flagship"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold">Main Image</h3>

        <div className="mt-3 space-y-4">
          <CloudinaryUploader
            label="Upload main image"
            folder={`${uploadFolderBase}/main`}
            value={mainImage.url ? mainImage : undefined}
            onUpload={(image) => setMainImage(image)}
            buttonText="Upload Main Image"
          />

          <input
            className="w-full rounded-lg border px-4 py-2"
            placeholder="Alt text"
            value={mainImage.alt || ""}
            onChange={(e) =>
              setMainImage((prev) => ({ ...prev, alt: e.target.value }))
            }
          />

          {mainImage.url ? (
            <button
              type="button"
              onClick={removeMainImage}
              disabled={isDeletingMainImage}
              className="rounded-lg border border-red-300 px-4 py-2 text-red-600 disabled:opacity-60"
            >
              {isDeletingMainImage ? "Removing..." : "Remove Main Image"}
            </button>
          ) : null}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Gallery Images</h3>
          <button
            type="button"
            onClick={addGalleryImage}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Add Image Slot
          </button>
        </div>

        <div className="space-y-4">
          {galleryImages.map((image, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-4">
              <CloudinaryUploader
                label={`Gallery Image ${index + 1}`}
                folder={`${uploadFolderBase}/gallery`}
                value={image.url ? image : undefined}
                onUpload={(uploadedImage) =>
                  setGalleryImages((prev) =>
                    prev.map((item, i) => (i === index ? uploadedImage : item))
                  )
                }
                buttonText="Upload Gallery Image"
              />

              <input
                className="w-full rounded-lg border px-4 py-2"
                placeholder="Alt text"
                value={image.alt || ""}
                onChange={(e) =>
                  updateGalleryImage(index, "alt", e.target.value)
                }
              />

              <button
                type="button"
                onClick={() => removeGalleryImage(index)}
                disabled={deletingGalleryIndex === index}
                className="rounded-lg border border-red-300 px-4 py-2 text-red-600 disabled:opacity-60"
              >
                {deletingGalleryIndex === index ? "Removing..." : "Remove"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Does this product have variations?
        </label>
        <select
          name="hasVariants"
          className="w-full rounded-lg border px-4 py-2 md:w-[240px]"
          value={hasVariants ? "true" : "false"}
          onChange={(e) => setHasVariants(e.target.value === "true")}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      {hasVariants ? (
        <>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Variation Types</h3>
              <button
                type="button"
                onClick={addOptionDefinition}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Add Variation Type
              </button>
            </div>

            <div className="space-y-4">
              {optionDefinitions.map((option, optionIndex) => (
                <div key={optionIndex} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <input
                      className="w-full max-w-[260px] rounded-lg border px-4 py-2"
                      placeholder="Variation name (e.g. color, storage)"
                      value={option.name}
                      onChange={(e) =>
                        updateOptionDefinitionName(optionIndex, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeOptionDefinition(optionIndex)}
                      className="rounded-lg border border-red-300 px-4 py-2 text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-2">
                    {option.values.map((value, valueIndex) => (
                      <div key={valueIndex} className="flex gap-2">
                        <input
                          className="w-full rounded-lg border px-4 py-2"
                          placeholder="Value (e.g. Black, 128GB)"
                          value={value}
                          onChange={(e) =>
                            updateOptionValue(
                              optionIndex,
                              valueIndex,
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeOptionValue(optionIndex, valueIndex)
                          }
                          className="rounded-lg border border-red-300 px-4 py-2 text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addOptionValue(optionIndex)}
                    className="mt-3 rounded-lg border px-4 py-2 text-sm"
                  >
                    Add Value
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Variants</h3>
              <button
                type="button"
                onClick={addVariant}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Add Variant
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="space-y-4 rounded-lg border p-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <input
                      className="rounded-lg border px-4 py-2"
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(e) =>
                        updateVariantField(index, "sku", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      className="rounded-lg border px-4 py-2"
                      placeholder="Price"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariantField(index, "price", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      className="rounded-lg border px-4 py-2"
                      placeholder="Stock"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariantField(index, "stock", e.target.value)
                      }
                    />
                  </div>

                  {optionNames.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {optionNames.map((optionName) => (
                        <input
                          key={optionName}
                          className="rounded-lg border px-4 py-2"
                          placeholder={optionName}
                          value={variant.options[optionName] || ""}
                          onChange={(e) =>
                            updateVariantOption(index, optionName, e.target.value)
                          }
                        />
                      ))}
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    <CloudinaryUploader
                      label="Variant Image (optional)"
                      folder={`${uploadFolderBase}/variants`}
                      value={variant.image}
                      onUpload={(uploadedImage) =>
                        setVariants((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  image: uploadedImage,
                                }
                              : item
                          )
                        )
                      }
                      buttonText="Upload Variant Image"
                    />

                    <input
                      className="w-full rounded-lg border px-4 py-2"
                      placeholder="Variant image alt"
                      value={variant.image?.alt || ""}
                      onChange={(e) =>
                        updateVariantImage(index, "alt", e.target.value)
                      }
                    />

                    {variant.image?.url ? (
                      <button
                        type="button"
                        onClick={() => removeVariantImage(index)}
                        disabled={deletingVariantImageIndex === index}
                        className="rounded-lg border border-red-300 px-4 py-2 text-red-600 disabled:opacity-60"
                      >
                        {deletingVariantImageIndex === index
                          ? "Removing..."
                          : "Remove Variant Image"}
                      </button>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-red-600"
                  >
                    Remove Variant
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>
          <h3 className="text-lg font-semibold">Single Product Pricing</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <input
              name="basePrice"
              type="number"
              className="rounded-lg border px-4 py-2"
              placeholder="Base Price"
            />
            <input
              name="baseStock"
              type="number"
              className="rounded-lg border px-4 py-2"
              placeholder="Base Stock"
            />
            <input
              name="baseSku"
              className="rounded-lg border px-4 py-2"
              placeholder="Base SKU"
            />
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Specifications</h3>
          <button
            type="button"
            onClick={addSpecification}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Add Specification
          </button>
        </div>

        <div className="space-y-3">
          {specifications.map((spec, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                className="rounded-lg border px-4 py-2"
                placeholder="Label (e.g. Display)"
                value={spec.label}
                onChange={(e) =>
                  updateSpecification(index, "label", e.target.value)
                }
              />
              <input
                className="rounded-lg border px-4 py-2"
                placeholder="Value (e.g. 6.3-inch OLED)"
                value={spec.value}
                onChange={(e) =>
                  updateSpecification(index, "value", e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                className="rounded-lg border border-red-300 px-4 py-2 text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Featured</label>
          <select
            name="isFeatured"
            className="w-full rounded-lg border px-4 py-2"
            defaultValue="false"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Published</label>
          <select
            name="isPublished"
            className="w-full rounded-lg border px-4 py-2"
            defaultValue="true"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">SEO Title</label>
        <input
          name="seoTitle"
          className="w-full rounded-lg border px-4 py-2"
          placeholder="Buy iPhone 16 Pro"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">SEO Description</label>
        <textarea
          name="seoDescription"
          className="w-full rounded-lg border px-4 py-2"
          rows={3}
          placeholder="Write a short SEO description"
        />
      </div>

      <input
        type="hidden"
        name="mainImage"
        value={JSON.stringify(mainImage)}
      />
      <input
        type="hidden"
        name="galleryImages"
        value={JSON.stringify(cleanedGalleryImages)}
      />
      <input
        type="hidden"
        name="optionDefinitions"
        value={JSON.stringify(hasVariants ? cleanedOptionDefinitions : [])}
      />
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(hasVariants ? cleanedVariants : [])}
      />
      <input
        type="hidden"
        name="specifications"
        value={JSON.stringify(cleanedSpecifications)}
      />

      {state.message ? (
        <p className={state.success ? "text-green-600" : "text-red-600"}>
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Create Product"}
      </button>
    </form>
  );
}