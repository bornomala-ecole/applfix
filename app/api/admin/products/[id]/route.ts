import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params;
  await prisma.product.delete({
    where: { id },
  })

  return Response.json({ success: true })
}


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json()
  const { id } = await params;

  // DELETE OLD RELATIONS FIRST (simple approach)
  await prisma.productImage.deleteMany({
    where: { productId:id },
  })

  await prisma.productVariant.deleteMany({
    where: { productId:id },
  })

  const product = await prisma.product.update({
    where: { id:id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      brandId: body.brandId,
      categoryId: body.categoryId,

      images: {
        create: body.images.map((img: any) => ({
          url: img.url,
        })),
      },

      variants: {
        create: body.variants.map((v: any) => ({
          storage: v.storage,
          price: v.price,
          stock: v.stock,
          sku: `${body.slug}-${v.storage}`,
        })),
      },
    },
  })

  return Response.json(product)
}