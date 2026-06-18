import { prisma } from "@/lib/prisma";
import ProductsClient from "./products-client";

type Props = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;

  const page = Number(pageParam || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [products, total, brands, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        brand: true,
        category: true, // ✅ ADD THIS
        variants: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  
    prisma.product.count(),
  
    prisma.brand.findMany(),
    prisma.category.findMany(), // ✅ ADD THIS
  ])

  return (
    <ProductsClient
      products={products}
      brands={brands}
      categories={categories}
      page={page}
      total={total}
      limit={limit}
    />
  );
}