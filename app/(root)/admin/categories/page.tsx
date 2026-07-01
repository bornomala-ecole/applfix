import { prisma } from "@/lib/prisma"
import CategoryClient from "./category-client"

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
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
    },
  })

  return <CategoryClient categories={categories} />
}