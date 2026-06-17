import { prisma } from "@/lib/prisma"
import { generateUniqueSlug } from "@/lib/utils/slugify"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const slug = body.slug ? await generateUniqueSlug(body.slug) : await generateUniqueSlug(body.name)

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
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
  } catch (error) {
    console.error(error)
    return new Response("Error creating product", { status: 500 })
  }
}