import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditProductClient from "./product-edit-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: [
          { type: "asc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
      },
      variants: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const [brands, categories] = await Promise.all([
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

  const safeProduct = {
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
  };

  return (
    <EditProductClient
      product={safeProduct}
      brands={brands}
      categories={categories}
    />
  );
}