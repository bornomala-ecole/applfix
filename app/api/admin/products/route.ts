// api/admin/products/route.ts 
import { prisma } from "@/lib/prisma"
import { generateUniqueSlug } from "@/lib/utils/slugify"


export async function POST(req: Request) {

  function generateSku(
    slug: string,
    title: string
  ) {
    return `${slug}-${title}`
      .toLowerCase()
      .replace(/\s+/g, "-")
  }


  try {
    const body = await req.json()
    
    if (!body.variants?.length) {
      return new Response(
        "At least one variant is required",
        { status: 400 }
      )
    }


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


        variants: {
          create: body.variants.map((v: any) => ({
            title: v.title,
            color: v.color || null,
            price: Number(v.price) || 0,
            stock: Number(v.stock) || 0,
            sku: `${slug}-${v.title}`
              .toLowerCase()
              .replace(/\s+/g, "-"),
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