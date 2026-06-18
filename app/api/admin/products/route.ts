// api/admin/products/route.ts 
import { prisma } from "@/lib/prisma"
import { generateUniqueSlug } from "@/lib/utils/slugify"


export async function POST(req: Request) {

  
  try {
    const body = await req.json()
    const slug = body.slug ? await generateUniqueSlug(body.slug) : await generateUniqueSlug(body.name)

    const brandId =
      body.brandId && body.brandId.trim() !== ""
        ? body.brandId
        : null

    const categoryId =
      body.categoryId && body.categoryId.trim() !== ""
        ? body.categoryId
        : null

    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
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

        images: {
          create: body.images.map((img: any) => ({
            url: img.url,
            publicId: img.publicId || null,
            type: img.type || "gallery",
          })),
        },
        price:
          body.variants?.length > 0
            ? null
            : Number(body.price) || 0,

        variants: body.variants?.length
        ? {
            create: body.variants.map((v: any) => ({
              storage: v.storage || null,
              price: v.price || 0,
              stock: v.stock || 0,
              sku: `${body.slug}-${v.storage || "default"}`,
            })),
          }
        : undefined,
      },
    })
    




    return Response.json(product)
  } catch (error) {
    console.error(error)
    return new Response("Error creating product", { status: 500 })
  }
}