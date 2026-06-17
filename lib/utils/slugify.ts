import slugify from "slugify"
import { prisma } from "@/lib/prisma"

export async function generateUniqueSlug(name: string) {
  let baseSlug = slugify(name, {
    lower: true,
    strict: true,
  })

  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug },
    })

    if (!existing) break

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}