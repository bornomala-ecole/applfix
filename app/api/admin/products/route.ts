import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/utils/slugify";
import { buildProductSearchText } from "@/lib/utils/productSearchText";

function makeSku(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name?.trim()) {
      return Response.json(
        {
          success: false,
          message: "Product name is required",
        },
        { status: 400 }
      );
    }

    const slugBase = body.slug?.trim() || body.name.trim();
    const slug = await generateUniqueSlug(slugBase);

    const brandId = body.brandId?.trim?.()
      ? String(body.brandId).trim()
      : null;

    const categoryId = body.categoryId?.trim?.()
      ? String(body.categoryId).trim()
      : null;

    const seriesId = body.seriesId?.trim?.()
      ? String(body.seriesId).trim()
      : null;

    const weightGrams =
      body.weightGrams === "" ||
      body.weightGrams === null ||
      body.weightGrams === undefined
        ? null
        : Number(body.weightGrams);

    if (weightGrams !== null && (!Number.isFinite(weightGrams) || weightGrams < 0)) {
      return Response.json(
        {
          success: false,
          message: "Weight must be a valid positive number in grams.",
        },
        { status: 400 }
      );
    }

    if (seriesId && !brandId) {
      return Response.json(
        {
          success: false,
          message: "Brand is required when selecting a series.",
        },
        { status: 400 }
      );
    }

    if (seriesId) {
      const selectedSeries = await prisma.series.findUnique({
        where: {
          id: seriesId,
        },
        select: {
          id: true,
          brandId: true,
        },
      });

      if (!selectedSeries) {
        return Response.json(
          {
            success: false,
            message: "Selected series does not exist.",
          },
          { status: 400 }
        );
      }

      if (selectedSeries.brandId !== brandId) {
        return Response.json(
          {
            success: false,
            message: "Selected series does not belong to selected brand.",
          },
          { status: 400 }
        );
      }
    }

    const incomingVariants = Array.isArray(body.variants) ? body.variants : [];

    if (incomingVariants.length === 0) {
      return Response.json(
        {
          success: false,
          message: "At least one variant is required.",
        },
        { status: 400 }
      );
    }

    const normalizedVariants = incomingVariants.map(
      (variant: any, index: number) => {
        const title = String(variant.title || "Default").trim();
        const color = String(variant.color || "").trim();

        const fallbackSku = makeSku(
          `${slug}-${title || "default"}-${color || index + 1}`
        );

        return {
          sku: String(variant.sku || fallbackSku).trim(),
          title,
          color: color || null,
          price: Number(variant.price || 0),
          comparePrice:
            variant.comparePrice === null ||
            variant.comparePrice === "" ||
            variant.comparePrice === undefined
              ? null
              : Number(variant.comparePrice),
          costPrice:
            variant.costPrice === null ||
            variant.costPrice === "" ||
            variant.costPrice === undefined
              ? null
              : Number(variant.costPrice),
          stock: Number(variant.stock || 0),
          lowStockThreshold: Number(variant.lowStockThreshold ?? 5),
          isActive:
            variant.isActive === undefined ? true : Boolean(variant.isActive),
        };
      }
    );

    const invalidVariant = normalizedVariants.find(
      (variant: any) =>
        !variant.sku ||
        !variant.title ||
        variant.price < 0 ||
        variant.stock < 0 ||
        variant.lowStockThreshold < 0
    );

    if (invalidVariant) {
      return Response.json(
        {
          success: false,
          message:
            "Each variant needs SKU, title, valid price, valid stock, and valid low stock threshold.",
        },
        { status: 400 }
      );
    }

    const incomingSkus = normalizedVariants.map((variant: any) => variant.sku);

    const hasDuplicateSku = new Set(incomingSkus).size !== incomingSkus.length;

    if (hasDuplicateSku) {
      return Response.json(
        {
          success: false,
          message: "Duplicate SKU found in variants.",
        },
        { status: 400 }
      );
    }

    const duplicateSku = await prisma.productVariant.findFirst({
      where: {
        sku: {
          in: incomingSkus,
        },
      },
      select: {
        sku: true,
      },
    });

    if (duplicateSku) {
      return Response.json(
        {
          success: false,
          message: `SKU already exists: ${duplicateSku.sku}`,
        },
        { status: 400 }
      );
    }

    const variantKeys = normalizedVariants.map((variant: any) => {
      return `${variant.title.toLowerCase()}::${variant.color || ""}`;
    });

    const hasDuplicateVariant =
      new Set(variantKeys).size !== variantKeys.length;

    if (hasDuplicateVariant) {
      return Response.json(
        {
          success: false,
          message:
            "Duplicate variant found. Title and color combination must be unique.",
        },
        { status: 400 }
      );
    }

    const incomingImages = Array.isArray(body.images) ? body.images : [];

    const normalizedImages = incomingImages
      .filter((image: any) => image.url)
      .map((image: any, index: number) => ({
        url: String(image.url),
        publicId: image.publicId || null,
        alt: image.alt || body.name,
        type: image.type === "main" ? "main" : "gallery",
        sortOrder:
          typeof image.sortOrder === "number" ? image.sortOrder : index,
      }));

    const [brand, category, series] = await Promise.all([
      brandId
        ? prisma.brand.findUnique({
            where: { id: brandId },
            select: { name: true },
          })
        : Promise.resolve(null),
      categoryId
        ? prisma.category.findUnique({
            where: { id: categoryId },
            select: { name: true },
          })
        : Promise.resolve(null),
      seriesId
        ? prisma.series.findUnique({
            where: { id: seriesId },
            select: { name: true },
          })
        : Promise.resolve(null),
    ]);

    const productSearchText = buildProductSearchText({
      name: String(body.name).trim(),
      brandName: brand?.name || null,
      categoryName: category?.name || null,
      seriesName: series?.name || null,
      variants: normalizedVariants,
    });

    const product = await prisma.product.create({
      data: {
        name: String(body.name).trim(),
        slug,

        description: body.description || null,
        shortDescription: body.shortDescription || null,

        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,

        productSearchText,
        weightGrams,

        brand: brandId
          ? {
              connect: {
                id: brandId,
              },
            }
          : undefined,

        category: categoryId
          ? {
              connect: {
                id: categoryId,
              },
            }
          : undefined,

        series: seriesId
          ? {
              connect: {
                id: seriesId,
              },
            }
          : undefined,

        isActive:
          body.isActive === undefined ? true : Boolean(body.isActive),

        isFeatured: Boolean(body.isFeatured),
        bestSelling: Boolean(body.bestSelling),

        images: normalizedImages.length
          ? {
              create: normalizedImages.map((image: any) => ({
                url: image.url,
                publicId: image.publicId,
                alt: image.alt,
                type: image.type,
                sortOrder: image.sortOrder,
              })),
            }
          : undefined,

        variants: {
          create: normalizedVariants.map((variant: any) => ({
            sku: variant.sku,
            title: variant.title,
            color: variant.color,
            price: variant.price,
            comparePrice: variant.comparePrice,
            costPrice: variant.costPrice,
            stock: variant.stock,
            lowStockThreshold: variant.lowStockThreshold,
            isActive: variant.isActive,
          })),
        },
      },
      include: {
        brand: true,
        category: true,
        series: true,
        images: true,
        variants: true,
      },
    });

    return Response.json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("PRODUCT CREATE ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Error creating product",
      },
      { status: 500 }
    );
  }
}