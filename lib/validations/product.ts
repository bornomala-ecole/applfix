import { z } from "zod";

const imageSchema = z.object({
  url: z.string().min(1),
  public_id: z.string().min(1),
  alt: z.string().optional(),
});

const optionDefinitionSchema = z.object({
  name: z.string().min(1),
  values: z.array(z.string().min(1)),
});

const variantSchema = z.object({
  sku: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  image: imageSchema.optional(),
  options: z.record(z.string(), z.string()),
});

const specificationSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const createProductSchema = z
  .object({
    name: z.string().min(2),
    slug: z.string().min(2),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    brand: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),

    mainImage: imageSchema,
    galleryImages: z.array(imageSchema).default([]),

    hasVariants: z.boolean(),
    optionDefinitions: z.array(optionDefinitionSchema).default([]),
    variants: z.array(variantSchema).default([]),

    basePrice: z.number().min(0).optional(),
    baseStock: z.number().min(0).optional(),
    baseSku: z.string().optional(),

    specifications: z.array(specificationSchema).default([]),

    isFeatured: z.boolean().default(false),
    isPublished: z.boolean().default(true),

    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasVariants) {
      if (data.variants.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "Variants are required when hasVariants is true.",
        });
      }
    } else {
      if (data.basePrice === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["basePrice"],
          message: "basePrice is required when product has no variants.",
        });
      }

      if (data.baseStock === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["baseStock"],
          message: "baseStock is required when product has no variants.",
        });
      }

      if (!data.baseSku) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["baseSku"],
          message: "baseSku is required when product has no variants.",
        });
      }
    }
  });