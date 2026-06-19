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



export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    include: {
      brand: true,
      category: true,
      images: {
        orderBy: [
          { type: "asc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
      },
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          price: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });
}