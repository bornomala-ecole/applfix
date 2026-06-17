import { prisma } from "@/lib/prisma"

export async function getProducts() {
  return await prisma.product.findMany({
    include: {
      brand: true,
      category: true,
      images: true,
      variants: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}