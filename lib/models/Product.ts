import mongoose, { Schema, model, models } from "mongoose";

const productImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    public_id: { type: String, required: true, trim: true },
    alt: { type: String, default: "" },
  },
  { _id: false }
);

const optionDefinitionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, lowercase: true },
    values: [{ type: String, required: true, trim: true }],
  },
  { _id: false }
);

const variantSchema = new Schema(
  {
    sku: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: productImageSchema, required: false },
    options: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { _id: false }
);

const specificationSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },

    brand: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],

    mainImage: { type: productImageSchema, required: true },
    galleryImages: { type: [productImageSchema], default: [] },

    hasVariants: { type: Boolean, default: false },
    optionDefinitions: { type: [optionDefinitionSchema], default: [] },
    variants: { type: [variantSchema], default: [] },

    basePrice: { type: Number, min: 0, default: null },
    baseStock: { type: Number, min: 0, default: null },
    baseSku: { type: String, trim: true, default: "" },

    specifications: { type: [specificationSchema], default: [] },

    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },

    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },

    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", category: "text" });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isPublished: 1 });

const Product = models.Product || model("Product", productSchema);

export default Product;