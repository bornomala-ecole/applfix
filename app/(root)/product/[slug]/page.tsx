import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./product-details-client";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    select: {
      name: true,
      metaTitle: true,
      metaDescription: true,
      shortDescription: true,
      description: true,
      images: {
        where: {
          type: "main",
        },
        select: {
          url: true,
        },
        take: 1,
      },
    },
  });

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.metaTitle || product.name,
    description:
      product.metaDescription ||
      product.shortDescription ||
      product.description ||
      `Shop ${product.name}`,
    openGraph: {
      title: product.metaTitle || product.name,
      description:
        product.metaDescription ||
        product.shortDescription ||
        product.description ||
        `Shop ${product.name}`,
      images: product.images?.[0]?.url
        ? [
            {
              url: product.images[0].url,
            },
          ]
        : [],
    },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      shortDescription: true,
      metaTitle: true,
      metaDescription: true,
      isActive: true,
      isFeatured: true,

      brand: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },

      category: {
        select: {
          id: true,
          name: true,
        },
      },

      images: {
        select: {
          id: true,
          url: true,
          publicId: true,
          alt: true,
          type: true,
          sortOrder: true,
        },
        orderBy: [
          {
            type: "asc",
          },
          {
            sortOrder: "asc",
          },
        ],
      },

      variants: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          sku: true,
          title: true,
          color: true,
          price: true,
          comparePrice: true,
          costPrice: true,
          stock: true,
          lowStockThreshold: true,
          isActive: true,
        },
        orderBy: {
          price: "asc",
        },
      },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      id: {
        not: product.id,
      },
      isActive: true,
      OR: [
        product.category?.id
          ? {
              categoryId: product.category.id,
            }
          : {},
        product.brand?.id
          ? {
              brandId: product.brand.id,
            }
          : {},
      ],
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
        where: {
          type: "main",
        },
        select: {
          id: true,
          url: true,
          alt: true,
          type: true,
          sortOrder: true,
        },
        take: 1,
      },

      variants: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          price: true,
          comparePrice: true,
          stock: true,
        },
        orderBy: {
          price: "asc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  return (
    <ProductDetailsClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}