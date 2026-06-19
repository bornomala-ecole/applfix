import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/utils/slugify";

// ======================
// DELETE PRODUCT
// ======================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const orderItemCount = await prisma.orderItem.count({
      where: {
        productId: id,
      },
    });

    // If product already has orders, do not hard-delete it.
    // Keep order history safe and just deactivate product.
    if (orderItemCount > 0) {
      await prisma.product.update({
        where: {
          id,
        },
        data: {
          isActive: false,
          isFeatured: false,
        },
      });

      return Response.json({
        success: true,
        message:
          "Product has existing orders, so it was deactivated instead of deleted.",
      });
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return Response.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("PRODUCT DELETE ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Error deleting product",
      },
      { status: 500 }
    );
  }
}

// ======================
// UPDATE PRODUCT
// ======================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await params;

    const brandId = body.brandId?.trim?.() ? body.brandId : null;
    const categoryId = body.categoryId?.trim?.()
      ? body.categoryId
      : null;

    if (!body.name?.trim()) {
      return Response.json(
        {
          success: false,
          message: "Product name is required",
        },
        { status: 400 }
      );
    }

    if (!body.slug?.trim()) {
      return Response.json(
        {
          success: false,
          message: "Product slug is required",
        },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(body.slug, id);

    const incomingVariants = Array.isArray(body.variants)
      ? body.variants
      : [];

    if (incomingVariants.length === 0) {
      return Response.json(
        {
          success: false,
          message: "At least one variant is required",
        },
        { status: 400 }
      );
    }

    // =========================
    // NORMALIZE VARIANTS
    // =========================
    const normalizedVariants = incomingVariants.map(
      (variant: any, index: number) => {
        const title = String(variant.title || "Default").trim();
        const color = String(variant.color || "").trim();

        const fallbackSku = `${slug}-${title || "default"}-${
          color || index + 1
        }`
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        return {
          id: variant.id || null,
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
          lowStockThreshold: Number(
            variant.lowStockThreshold ?? 5
          ),
          isActive: Boolean(variant.isActive),
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

    // Check duplicate SKU inside same request
    const incomingSkus = normalizedVariants.map(
      (variant: any) => variant.sku
    );

    const hasDuplicateSku =
      new Set(incomingSkus).size !== incomingSkus.length;

    if (hasDuplicateSku) {
      return Response.json(
        {
          success: false,
          message: "Duplicate SKU found in variants.",
        },
        { status: 400 }
      );
    }

    const existingVariants = await prisma.productVariant.findMany({
      where: {
        productId: id,
      },
      select: {
        id: true,
      },
    });

    const existingVariantIds = existingVariants.map(
      (variant) => variant.id
    );

    const incomingExistingVariantIds = normalizedVariants
      .filter((variant: any) => variant.id)
      .map((variant: any) => variant.id);

    const invalidVariantId = incomingExistingVariantIds.find(
      (variantId: string) => !existingVariantIds.includes(variantId)
    );

    if (invalidVariantId) {
      return Response.json(
        {
          success: false,
          message: "Invalid variant detected.",
        },
        { status: 400 }
      );
    }

    // Check duplicate SKU in database, excluding the same incoming variant IDs
    const duplicateSku = await prisma.productVariant.findFirst({
      where: {
        sku: {
          in: incomingSkus,
        },
        NOT: {
          id: {
            in: incomingExistingVariantIds.length
              ? incomingExistingVariantIds
              : ["__none__"],
          },
        },
      },
      select: {
        id: true,
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

    // =========================
    // NORMALIZE IMAGES
    // =========================
    const incomingImages = Array.isArray(body.images)
      ? body.images
      : [];

    const normalizedImages = incomingImages
      .filter((image: any) => image.url)
      .map((image: any, index: number) => ({
        url: String(image.url),
        publicId: image.publicId || null,
        alt: image.alt || body.name,
        type: image.type === "main" ? "main" : "gallery",
        sortOrder:
          typeof image.sortOrder === "number"
            ? image.sortOrder
            : index,
      }));

    // =========================
    // UPDATE EVERYTHING IN TRANSACTION
    // =========================
    const product = await prisma.$transaction(async (tx) => {
      // =========================
      // 1. UPDATE MAIN PRODUCT
      // =========================
      const updatedProduct = await tx.product.update({
        where: {
          id,
        },
        data: {
          name: body.name,
          slug,
          description: body.description || null,
          shortDescription: body.shortDescription || null,
          metaTitle: body.metaTitle || null,
          metaDescription: body.metaDescription || null,
          brandId,
          categoryId,
          isActive: Boolean(body.isActive),
          isFeatured: Boolean(body.isFeatured),
        },
      });

      // =========================
      // 2. IMAGES RESET
      // Product images are safe to recreate because orders do not depend on them.
      // =========================
      await tx.productImage.deleteMany({
        where: {
          productId: id,
        },
      });

      if (normalizedImages.length > 0) {
        await tx.productImage.createMany({
          data: normalizedImages.map((image: any) => ({
            productId: id,
            url: image.url,
            publicId: image.publicId,
            alt: image.alt,
            type: image.type,
            sortOrder: image.sortOrder,
          })),
        });
      }

      // =========================
      // 3. VARIANT SYNC
      // Do not blindly delete variants used in order history.
      // =========================
      const variantsToRemove = existingVariants.filter(
        (variant) =>
          !incomingExistingVariantIds.includes(variant.id)
      );

      for (const variantToRemove of variantsToRemove) {
        const orderItemCount = await tx.orderItem.count({
          where: {
            variantId: variantToRemove.id,
          },
        });

        if (orderItemCount > 0) {
          // Keep old order references safe.
          // Hide old variant instead of deleting it.
          await tx.productVariant.update({
            where: {
              id: variantToRemove.id,
            },
            data: {
              isActive: false,
              stock: 0,
            },
          });
        } else {
          await tx.productVariant.delete({
            where: {
              id: variantToRemove.id,
            },
          });
        }
      }

      for (const variant of normalizedVariants) {
        const variantData = {
          productId: id,
          sku: variant.sku,
          title: variant.title,
          color: variant.color,
          price: variant.price,
          comparePrice: variant.comparePrice,
          costPrice: variant.costPrice,
          stock: variant.stock,
          lowStockThreshold: variant.lowStockThreshold,
          isActive: variant.isActive,
        };

        if (variant.id) {
          await tx.productVariant.update({
            where: {
              id: variant.id,
            },
            data: variantData,
          });
        } else {
          await tx.productVariant.create({
            data: variantData,
          });
        }
      }

      return updatedProduct;
    });

    return Response.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("PRODUCT UPDATE ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Error updating product",
      },
      { status: 500 }
    );
  }
}