import { prisma } from "@/lib/prisma";

export async function getBrandSeriesMenu() {
  const brands = await prisma.brand.findMany({
    where: {
      products: {
        some: {
          isActive: true,
        },
      },
    },
    orderBy: [
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
      logo: true,

      series: {
        where: {
          products: {
            some: {
              isActive: true,
            },
          },
        },
        orderBy: [
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
          products: {
            where: {
              isActive: true,
            },
            orderBy: {
              name: "asc",
            },
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },

      products: {
        where: {
          isActive: true,
          seriesId: null,
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return brands;
}