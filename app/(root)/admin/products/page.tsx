import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import ProductsClient from "./products-client";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    brand?: string;
    category?: string;
    status?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const {
    page: pageParam,
    search: searchParam,
    brand: brandParam,
    category: categoryParam,
    status: statusParam,
  } = await searchParams;

  const page = Math.max(Number(pageParam || 1), 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const search = searchParam?.trim() || "";
  const brand = brandParam && brandParam !== "all" ? brandParam : undefined;
  const category =
    categoryParam && categoryParam !== "all" ? categoryParam : undefined;

  const status =
    statusParam === "active" || statusParam === "inactive"
      ? statusParam
      : "all";

  const where: Prisma.ProductWhereInput = {
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          brand: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          category: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ],
    }),

    ...(brand && {
      brandId: brand,
    }),

    ...(category && {
      categoryId: category,
    }),

    ...(status !== "all" && {
      isActive: status === "active",
    }),
  };

  const [products, total, brands, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        variants: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.product.count({
      where,
    }),

    prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const safeProducts = products.map((product) => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: product.images.map((image) => ({
      ...image,
      createdAt: image.createdAt.toISOString(),
      updatedAt: image.updatedAt.toISOString(),
    })),
    variants: product.variants.map((variant) => ({
      ...variant,
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
    })),
  }));

  return (
    <ProductsClient
      products={safeProducts}
      brands={brands}
      categories={categories}
      page={page}
      total={total}
      limit={limit}
      search={search}
      brandFilter={brand || "all"}
      categoryFilter={category || "all"}
      statusFilter={status}
    />
  );
}