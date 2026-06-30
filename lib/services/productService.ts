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


export async function getBestSellingProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      bestSelling: true,
    },
    take: 8,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      brand: {
        select: {
          name: true,
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          url: true,
          alt: true,
          type: true,
          sortOrder: true,
        },
      },
      variants: {
        where: {
          isActive: true,
        },
        orderBy: [
          {
            stock: "desc",
          },
          {
            price: "asc",
          },
        ],
        select: {
          id: true,
          title: true,
          color: true,
          price: true,
          comparePrice: true,
          stock: true,
        },
      },
    },
  });
}