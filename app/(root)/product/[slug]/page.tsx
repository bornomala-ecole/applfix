import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import ProductDetailsClient from "./product-details-client";

export const dynamic = "force-static";
export const revalidate = 3600;

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type RelatedProductRow = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  brandName: string | null;
  imageId: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageType: string | null;
  imageSortOrder: number | null;
  variantId: string | null;
  variantPrice: number | Prisma.Decimal | null;
  variantComparePrice: number | Prisma.Decimal | null;
  variantStock: number | null;
};

function now() {
  return performance.now();
}

function logTiming(label: string, startedAt: number) {
  console.log(
    `[product details page] ${label}: ${(now() - startedAt).toFixed(2)}ms`
  );
}

async function timeAsync<T>(label: string, callback: () => Promise<T>) {
  const startedAt = now();

  try {
    return await callback();
  } finally {
    logTiming(label, startedAt);
  }
}

function toNumber(value: number | Prisma.Decimal | null): number | null {
  if (value === null) return null;
  return Number(value);
}

const getProductMetadataBySlug = unstable_cache(
  async (slug: string) => {
    return timeAsync("metadata DB", () =>
      prisma.product.findUnique({
        where: {
          slug,
        },
        select: {
          name: true,
          metaTitle: true,
          metaDescription: true,
          shortDescription: true,
          description: true,
          isActive: true,
          images: {
            where: {
              type: "main",
            },
            select: {
              url: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
            take: 1,
          },
        },
      })
    );
  },
  ["product-metadata-by-slug"],
  {
    revalidate: 3600,
    tags: ["product-details"],
  }
);

const getProductCoreBySlug = unstable_cache(
  async (slug: string) => {
    return timeAsync("product core DB", () =>
      prisma.product.findUnique({
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
        },
      })
    );
  },
  ["product-core-by-slug"],
  {
    revalidate: 3600,
    tags: ["product-details"],
  }
);

const getProductImages = unstable_cache(
  async (productId: string) => {
    return timeAsync("product images DB", () =>
      prisma.productImage.findMany({
        where: {
          productId,
        },
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
          {
            id: "asc",
          },
        ],
      })
    );
  },
  ["product-images-by-product-id"],
  {
    revalidate: 3600,
    tags: ["product-details"],
  }
);

const getProductVariants = unstable_cache(
  async (productId: string) => {
    return timeAsync("product variants DB", () =>
      prisma.productVariant.findMany({
        where: {
          productId,
          isActive: true,
        },
        select: {
          id: true,
          sku: true,
          title: true,
          color: true,
          price: true,
          comparePrice: true,

          /**
           * Kept for current product-details-client compatibility.
           * We can remove these later if you want a smaller payload.
           */
          costPrice: true,
          lowStockThreshold: true,
          isActive: true,

          stock: true,
        },
        orderBy: [
          {
            stock: "desc",
          },
          {
            price: "asc",
          },
          {
            id: "asc",
          },
        ],
      })
    );
  },
  ["product-variants-by-product-id"],
  {
    revalidate: 3600,
    tags: ["product-details"],
  }
);

const getRelatedProducts = unstable_cache(
  async (params: {
    productId: string;
    brandId?: string;
    categoryId?: string;
  }) => {
    const { productId, brandId, categoryId } = params;

    if (!brandId && !categoryId) {
      return [];
    }

    const relationSqlParts: Prisma.Sql[] = [];

    if (categoryId) {
      relationSqlParts.push(Prisma.sql`p."categoryId" = ${categoryId}`);
    }

    if (brandId) {
      relationSqlParts.push(Prisma.sql`p."brandId" = ${brandId}`);
    }

    const relationSql = Prisma.join(relationSqlParts, " OR ");

    const rows = await timeAsync("related products DB", () =>
      prisma.$queryRaw<RelatedProductRow[]>(
        Prisma.sql`
          SELECT
            p.id,
            p.name,
            p.slug,
            p."shortDescription",
            b.name AS "brandName",

            image.id AS "imageId",
            image.url AS "imageUrl",
            image.alt AS "imageAlt",
            image.type AS "imageType",
            image."sortOrder" AS "imageSortOrder",

            variant.id AS "variantId",
            variant.price AS "variantPrice",
            variant."comparePrice" AS "variantComparePrice",
            variant.stock AS "variantStock"

          FROM "Product" p

          LEFT JOIN "Brand" b ON b.id = p."brandId"

          LEFT JOIN LATERAL (
            SELECT
              pi.id,
              pi.url,
              pi.alt,
              pi.type,
              pi."sortOrder"
            FROM "ProductImage" pi
            WHERE pi."productId" = p.id
              AND pi.type = 'main'
            ORDER BY pi."sortOrder" ASC, pi.id ASC
            LIMIT 1
          ) image ON true

          LEFT JOIN LATERAL (
            SELECT
              pv.id,
              pv.price,
              pv."comparePrice",
              pv.stock
            FROM "ProductVariant" pv
            WHERE pv."productId" = p.id
              AND pv."isActive" = true
            ORDER BY
              pv.stock DESC,
              pv.price ASC,
              pv.id ASC
            LIMIT 1
          ) variant ON true

          WHERE p.id <> ${productId}
            AND p."isActive" = true
            AND (${relationSql})
            AND EXISTS (
              SELECT 1
              FROM "ProductVariant" active_variant
              WHERE active_variant."productId" = p.id
                AND active_variant."isActive" = true
            )

          ORDER BY p."createdAt" DESC
          LIMIT 4
        `
      )
    );

    const mapStartedAt = now();

    const relatedProducts = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      shortDescription: row.shortDescription,
      brand: row.brandName
        ? {
            name: row.brandName,
          }
        : null,
      images: row.imageId
        ? [
            {
              id: row.imageId,
              url: row.imageUrl ?? "",
              alt: row.imageAlt,
              type: row.imageType ?? "main",
              sortOrder: row.imageSortOrder ?? 0,
            },
          ]
        : [],
      variants: row.variantId
        ? [
            {
              id: row.variantId,
              price: toNumber(row.variantPrice) ?? 0,
              comparePrice: toNumber(row.variantComparePrice),
              stock: row.variantStock ?? 0,
            },
          ]
        : [],
    }));

    logTiming("related products map", mapStartedAt);

    return relatedProducts;
  },
  ["related-products-by-product"],
  {
    revalidate: 3600,
    tags: ["product-details"],
  }
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const totalStartedAt = now();

  const { slug } = await params;

  const product = await getProductMetadataBySlug(slug);

  logTiming("metadata total", totalStartedAt);

  if (!product || !product.isActive) {
    return {
      title: "Product Not Found",
    };
  }

  const title = product.metaTitle || product.name;

  const description =
    product.metaDescription ||
    product.shortDescription ||
    product.description ||
    `Shop ${product.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
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
  const totalStartedAt = now();

  const { slug } = await params;

  console.log("[product details page] request start", {
    slug,
  });

  const productCore = await getProductCoreBySlug(slug);

  if (!productCore || !productCore.isActive) {
    logTiming("not found total", totalStartedAt);
    notFound();
  }

  const [images, variants, relatedProducts] = await Promise.all([
    getProductImages(productCore.id),
    getProductVariants(productCore.id),
    getRelatedProducts({
      productId: productCore.id,
      brandId: productCore.brand?.id,
      categoryId: productCore.category?.id,
    }),
  ]);

  const composeStartedAt = now();

  const product = {
    ...productCore,
    images,
    variants,
  };

  logTiming("compose payload", composeStartedAt);

  console.log("[product details page] result", {
    productId: product.id,
    slug: product.slug,
    images: product.images.length,
    variants: product.variants.length,
    relatedProducts: relatedProducts.length,
  });

  logTiming("total", totalStartedAt);

  return (
    <ProductDetailsClient
      product={product}
      relatedProducts={relatedProducts}
      initialWishlisted={false}
    />
  );
}