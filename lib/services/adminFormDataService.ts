import { prisma } from "@/lib/prisma"

export async function getAdminProductFormData() {
  const [brands, categories, series] = await Promise.all([
    prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.series.findMany({
      orderBy: [
        {
          brand: {
            name: "asc",
          },
        },
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        id: true,
        name: true,
        brandId: true,
      },
    }),
  ])

  return {
    brands,
    categories,
    series,
  }
}