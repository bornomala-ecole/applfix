import { prisma } from "@/lib/prisma"

export async function getAdminFormData() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany(),
    prisma.category.findMany(),
  ])

  return { brands, categories }
}