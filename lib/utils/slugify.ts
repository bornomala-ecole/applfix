import slugify from "slugify"
import { prisma } from "@/lib/prisma"

export async function generateUniqueSlug(
  name: string,
  excludeProductId?: string
) {
  const baseSlug = slugify(name, {
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

    if (
      excludeProductId &&
      existing.id === excludeProductId
    ) {
      break
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}