import { prisma } from "@/lib/prisma"
import BrandCarouselClient from "./BrandCarouselClient"

export default async function BrandCarousel() {
  const brands = await prisma.brand.findMany({
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      name: true,
      logo: true,
      sortOrder: true,
      slug: true,
    },
  })

  if (!brands.length) {
    return null
  }

  return <BrandCarouselClient brands={brands} />
}