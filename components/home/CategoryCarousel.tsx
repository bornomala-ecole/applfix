import { prisma } from "@/lib/prisma"
import CategoryCarouselClient from "./CategoryCarouselClient"

export default async function CategoryCarousel() {
  const categories = await prisma.category.findMany({
    where: {
      products: {
        some: {
          isActive: true,
        },
      },
    },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      sortOrder: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  })

  if (!categories.length) {
    return null
  }

  return (
    <CategoryCarouselClient
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image,
        sortOrder: category.sortOrder,
        productCount: category._count.products,
      }))}
    />
  )
}