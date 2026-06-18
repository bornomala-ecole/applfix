import { prisma } from "@/lib/prisma"
import { generateUniqueSlug } from "@/lib/utils/slugify"

// ======================
// DELETE PRODUCT
// ======================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.product.delete({
    where: { id },
  })

  return Response.json({ success: true })
}

// ======================
// UPDATE PRODUCT
// ======================

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json()
    const { id } = await params

    const brandId =
      body.brandId?.trim?.() ? body.brandId : null

    const categoryId =
      body.categoryId?.trim?.() ? body.categoryId : null

      const slug = await generateUniqueSlug(body.slug, id)

    // =========================
    // 1. UPDATE MAIN PRODUCT
    // =========================
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug,
        description: body.description,
        brandId,
        categoryId,
        isActive: body.isActive,
    
        price:
          body.variants?.length > 0
            ? null
            : Number(body.price) || 0,
    
        stock:
          body.variants?.length > 0
            ? null
            : Number(body.stock) || 0,
      },
    })

    // =========================
    // 2. IMAGES RESET (SAFE)
    // =========================
    await prisma.productImage.deleteMany({
      where: { productId: id },
    })

    if (body.images?.length) {
      await prisma.productImage.createMany({
        data: body.images.map((img: any) => ({
          url: img.url,
          publicId: img.publicId || null,
          type: img.type || "gallery",
          productId: id,
        })),
      })
    }

    // =========================
    // 3. VARIANTS (FIXED STOCK + PRICE)
    // =========================
    await prisma.productVariant.deleteMany({
      where: { productId: id },
    })

    if (body.variants?.length > 0) {
      await prisma.productVariant.createMany({
        data: body.variants.map((v: any) => ({
          productId: id,
          storage: v.storage || null,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,   // ✅ FIXED STOCK ISSUE
          sku: `${slug}-${v.storage || "default"}`,
        })),
      })
    }

    return Response.json(product)
  } catch (error) {
    console.error("PRODUCT UPDATE ERROR:", error)
    return new Response("Error updating product", { status: 500 })
  }
}