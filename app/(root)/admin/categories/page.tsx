import { prisma } from "@/lib/prisma"
import CategoryClient from "./category-client"

export default async function BrandsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <CategoryClient categories={categories} />
}