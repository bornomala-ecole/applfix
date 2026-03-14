"use server";

import { revalidatePath } from "next/cache";
import Product from "@/lib/models/Product";
import { connectDB } from "@/lib/db";
import { createProductSchema } from "@/lib/validations/product";
import { slugify } from "@/lib/slugify";

type CreateProductState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createProductAction(
  _prevState: CreateProductState,
  formData: FormData
): Promise<CreateProductState> {
  try {
    await connectDB();

    const rawName = String(formData.get("name") || "");
    const rawSlug = String(formData.get("slug") || "");

    const payload = {
      name: rawName,
      slug: slugify(rawSlug || rawName),
      shortDescription: String(formData.get("shortDescription") || ""),
      description: String(formData.get("description") || ""),
      brand: String(formData.get("brand") || ""),
      category: String(formData.get("category") || ""),
      // tags: JSON.parse(String(formData.get("tags") || "[]")),
      tags: String(formData.get("tagsInput") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),

      mainImage: JSON.parse(String(formData.get("mainImage") || "{}")),
      galleryImages: JSON.parse(String(formData.get("galleryImages") || "[]")),

      hasVariants: String(formData.get("hasVariants") || "false") === "true",
      optionDefinitions: JSON.parse(
        String(formData.get("optionDefinitions") || "[]")
      ),
      variants: JSON.parse(String(formData.get("variants") || "[]")),

      basePrice: formData.get("basePrice")
        ? Number(formData.get("basePrice"))
        : undefined,
      baseStock: formData.get("baseStock")
        ? Number(formData.get("baseStock"))
        : undefined,
      baseSku: String(formData.get("baseSku") || ""),

      specifications: JSON.parse(
        String(formData.get("specifications") || "[]")
      ),

      isFeatured: String(formData.get("isFeatured") || "false") === "true",
      isPublished: String(formData.get("isPublished") || "true") === "true",

      seoTitle: String(formData.get("seoTitle") || ""),
      seoDescription: String(formData.get("seoDescription") || ""),
    };

    const validated = createProductSchema.safeParse(payload);

    if (!validated.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const existing = await Product.findOne({ slug: validated.data.slug });
    if (existing) {
      return {
        success: false,
        message: "A product with this slug already exists.",
      };
    }

    await Product.create({
      ...validated.data,
      averageRating: 0,
      numReviews: 0,
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return {
      success: true,
      message: "Product created successfully.",
    };
  } catch (error) {
    console.error("createProductAction error:", error);
    return {
      success: false,
      message: "Something went wrong while creating product.",
    };
  }
}