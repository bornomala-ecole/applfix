import "server-only";

import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  BrandFilterOption,
  CategoryFilterOption,
  FilterState,
  ShopPagination,
  ShopProduct,
  SortOption,
} from "@/lib/types/shop";

type SearchParamsValue = string | string[] | undefined;

export type ShopSearchParams = {
  q?: SearchParamsValue;
  brand?: SearchParamsValue;
  category?: SearchParamsValue;
  min_price?: SearchParamsValue;
  max_price?: SearchParamsValue;
  on_sale?: SearchParamsValue;
  sort?: SearchParamsValue;
  page?: SearchParamsValue;
};

const DEFAULT_PRICE_RANGE: [number, number] = [0, 2000];
const DEFAULT_PAGE_SIZE = 12;

type ProductVariantDbRecord = {
  id: string;
  sku: string;
  title: string;
  color: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
};

type ProductCardRow = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  createdAt: Date;
  isFeatured: boolean;

  brandName: string | null;
  categoryName: string | null;

  imageUrl: string | null;
  imageAlt: string | null;

  variantTitle: string;
  variantColor: string | null;
  price: number | Prisma.Decimal;
  comparePrice: number | Prisma.Decimal | null;

  stock: number | bigint | null;
  hasSale: boolean | null;
};

interface GetShopProductsArgs {
  query: string;
  filters: FilterState;
  sort: SortOption;
  page: number;
  pageSize?: number;
}

function now() {
  return performance.now();
}

function logTiming(label: string, startedAt: number) {
  console.log(`[shopService] ${label}: ${(now() - startedAt).toFixed(2)}ms`);
}

async function timeAsync<T>(label: string, callback: () => Promise<T>) {
  const startedAt = now();

  try {
    return await callback();
  } finally {
    logTiming(label, startedAt);
  }
}

function getSingleParam(value: SearchParamsValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getArrayParam(value: SearchParamsValue): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback;

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toPositiveInteger(value: string | undefined, fallback: number) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 1) {
    return fallback;
  }

  return Math.floor(number);
}

function toNumberValue(value: number | Prisma.Decimal | null): number | null {
  if (value === null) return null;
  return Number(value);
}

export function parseShopQuery(searchParams: ShopSearchParams): string {
  return getSingleParam(searchParams.q)?.trim() ?? "";
}

export function parseShopSort(value: SearchParamsValue): SortOption {
  const sort = getSingleParam(value);

  const allowedSorts: SortOption[] = [
    "featured",
    "newest",
    "price_asc",
    "price_desc",
  ];

  return allowedSorts.includes(sort as SortOption)
    ? (sort as SortOption)
    : "featured";
}

export function parseShopPage(value: SearchParamsValue): number {
  return toPositiveInteger(getSingleParam(value), 1);
}

export function parseShopFilters(
  searchParams: ShopSearchParams,
  priceBounds: [number, number] = DEFAULT_PRICE_RANGE
): FilterState {
  const minPrice = toNumber(
    getSingleParam(searchParams.min_price),
    priceBounds[0]
  );

  const maxPrice = toNumber(
    getSingleParam(searchParams.max_price),
    priceBounds[1]
  );

  return {
    brands: getArrayParam(searchParams.brand),
    categories: getArrayParam(searchParams.category),
    priceRange: [
      Math.max(priceBounds[0], minPrice),
      Math.max(minPrice, maxPrice),
    ],
    onSale: getSingleParam(searchParams.on_sale) === "true",
  };
}

function getProductCardBadge(product: {
  isFeatured: boolean;
  createdAt: Date;
  stock: number;
  hasSale: boolean;
}): ShopProduct["badge"] {
  if (product.stock <= 0) return "Out of Stock";
  if (product.hasSale) return "Sale";
  if (product.isFeatured) return "Featured";

  const daysOld =
    (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysOld <= 14) return "New";

  return undefined;
}

async function getShopFilterDataUncached(): Promise<{
  brands: BrandFilterOption[];
  categories: CategoryFilterOption[];
  priceBounds: [number, number];
}> {
  const totalStartedAt = now();

  console.log("[shopService] filter metadata start");

  const [brands, brandCounts, categories, categoryCounts, priceAggregate] =
    await timeAsync("filter metadata DB", () =>
      Promise.all([
        prisma.brand.findMany({
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        }),

        prisma.product.groupBy({
          by: ["brandId"],
          where: {
            isActive: true,
            brandId: {
              not: null,
            },
            variants: {
              some: {
                isActive: true,
              },
            },
          },
          _count: {
            _all: true,
          },
        }),

        prisma.category.findMany({
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        }),

        prisma.product.groupBy({
          by: ["categoryId"],
          where: {
            isActive: true,
            categoryId: {
              not: null,
            },
            variants: {
              some: {
                isActive: true,
              },
            },
          },
          _count: {
            _all: true,
          },
        }),

        prisma.productVariant.aggregate({
          where: {
            isActive: true,
            product: {
              isActive: true,
            },
          },
          _min: {
            price: true,
          },
          _max: {
            price: true,
          },
        }),
      ])
    );

  const mapStartedAt = now();

  const brandCountMap = brandCounts.reduce<Record<string, number>>(
    (acc, item) => {
      if (!item.brandId) return acc;
      acc[item.brandId] = item._count._all;
      return acc;
    },
    {}
  );

  const categoryCountMap = categoryCounts.reduce<Record<string, number>>(
    (acc, item) => {
      if (!item.categoryId) return acc;
      acc[item.categoryId] = item._count._all;
      return acc;
    },
    {}
  );

  const activeBrands = brands
    .map((brand) => ({
      id: brand.id,
      name: brand.name,
      count: brandCountMap[brand.id] ?? 0,
    }))
    .filter((brand) => brand.count > 0);

  const activeCategories = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      count: categoryCountMap[category.id] ?? 0,
    }))
    .filter((category) => category.count > 0);

  const minPrice = Math.floor(
    Number(priceAggregate._min.price ?? DEFAULT_PRICE_RANGE[0])
  );

  const maxPrice = Math.ceil(
    Number(priceAggregate._max.price ?? DEFAULT_PRICE_RANGE[1])
  );

  logTiming("filter metadata map", mapStartedAt);
  logTiming("filter metadata total", totalStartedAt);

  return {
    brands: activeBrands,
    categories: activeCategories,
    priceBounds: [minPrice, maxPrice],
  };
}

export const getShopFilterData = unstable_cache(
  getShopFilterDataUncached,
  ["shop-filter-data"],
  {
    revalidate: 3600,
    tags: ["shop-filter-data"],
  }
);

function buildVariantFilterSql(
  alias: "ev" | "card_variant" | "summary_variant",
  filters: FilterState
): Prisma.Sql {
  const aliasSql = Prisma.raw(alias);

  const parts: Prisma.Sql[] = [
    Prisma.sql`${aliasSql}."isActive" = true`,
    Prisma.sql`${aliasSql}."price" >= ${filters.priceRange[0]}`,
    Prisma.sql`${aliasSql}."price" <= ${filters.priceRange[1]}`,
  ];

  if (filters.onSale) {
    parts.push(
      Prisma.sql`${aliasSql}."comparePrice" IS NOT NULL`,
      Prisma.sql`${aliasSql}."comparePrice" > ${aliasSql}."price"`
    );
  }

  return Prisma.join(parts, " AND ");
}

function buildProductWhereSql(
  query: string,
  filters: FilterState
): Prisma.Sql {
  const parts: Prisma.Sql[] = [
    Prisma.sql`p."isActive" = true`,
    Prisma.sql`EXISTS (
      SELECT 1
      FROM "ProductVariant" ev
      WHERE ev."productId" = p.id
        AND ${buildVariantFilterSql("ev", filters)}
    )`,
  ];

  if (query) {
    parts.push(Prisma.sql`p."productSearchText" ILIKE ${`%${query}%`}`);
  }

  if (filters.brands.length > 0) {
    parts.push(
      Prisma.sql`b."name" IN (${Prisma.join(
        filters.brands.map((brand) => Prisma.sql`${brand}`)
      )})`
    );
  }

  if (filters.categories.length > 0) {
    parts.push(
      Prisma.sql`c."name" IN (${Prisma.join(
        filters.categories.map((category) => Prisma.sql`${category}`)
      )})`
    );
  }

  return Prisma.join(parts, " AND ");
}

function buildProductOrderSql(sort: SortOption): Prisma.Sql {
  if (sort === "newest") {
    return Prisma.sql`p."createdAt" DESC, p.id ASC`;
  }

  if (sort === "price_asc") {
    return Prisma.sql`card_variant."price" ASC, p."createdAt" DESC, p.id ASC`;
  }

  if (sort === "price_desc") {
    return Prisma.sql`card_variant."price" DESC, p."createdAt" DESC, p.id ASC`;
  }

  return Prisma.sql`p."isFeatured" DESC, p."createdAt" DESC, p.id ASC`;
}

async function fetchProductCards(params: {
  query: string;
  filters: FilterState;
  sort: SortOption;
  skip: number;
  take: number;
}): Promise<ProductCardRow[]> {
  const { query, filters, sort, skip, take } = params;

  return prisma.$queryRaw<ProductCardRow[]>(
    Prisma.sql`
      SELECT
        p.id,
        p.name,
        p.slug,
        p."shortDescription",
        p."createdAt",
        p."isFeatured",
        b.name AS "brandName",
        c.name AS "categoryName",
        card_image.url AS "imageUrl",
        card_image.alt AS "imageAlt",
        card_variant.title AS "variantTitle",
        card_variant.color AS "variantColor",
        card_variant.price,
        card_variant."comparePrice",
        COALESCE(variant_summary.stock, 0)::int AS stock,
        COALESCE(variant_summary."hasSale", false) AS "hasSale"
      FROM "Product" p
      LEFT JOIN "Brand" b ON b.id = p."brandId"
      LEFT JOIN "Category" c ON c.id = p."categoryId"

      LEFT JOIN LATERAL (
        SELECT pi.url, pi.alt
        FROM "ProductImage" pi
        WHERE pi."productId" = p.id
        ORDER BY
          CASE WHEN pi.type = 'main' THEN 0 ELSE 1 END,
          pi."sortOrder" ASC,
          pi.id ASC
        LIMIT 1
      ) card_image ON true

      JOIN LATERAL (
        SELECT
          card_variant.title,
          card_variant.color,
          card_variant.price,
          card_variant."comparePrice",
          card_variant.stock
        FROM "ProductVariant" card_variant
        WHERE card_variant."productId" = p.id
          AND ${buildVariantFilterSql("card_variant", filters)}
        ORDER BY
          CASE WHEN card_variant.stock > 0 THEN 0 ELSE 1 END,
          card_variant.price ASC,
          card_variant.id ASC
        LIMIT 1
      ) card_variant ON true

      LEFT JOIN LATERAL (
        SELECT
          COALESCE(SUM(summary_variant.stock), 0)::int AS stock,
          BOOL_OR(
            summary_variant."comparePrice" IS NOT NULL
            AND summary_variant."comparePrice" > summary_variant.price
          ) AS "hasSale"
        FROM "ProductVariant" summary_variant
        WHERE summary_variant."productId" = p.id
          AND ${buildVariantFilterSql("summary_variant", filters)}
      ) variant_summary ON true

      WHERE ${buildProductWhereSql(query, filters)}
      ORDER BY ${buildProductOrderSql(sort)}
      LIMIT ${take} OFFSET ${skip}
    `
  );
}

function mapProductCard(row: ProductCardRow): ShopProduct {
  const price = toNumberValue(row.price) ?? 0;
  const comparePrice = toNumberValue(row.comparePrice);
  const stock = Number(row.stock ?? 0);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,

    brand: row.brandName ?? "Unbranded",
    category: row.categoryName ?? undefined,

    image: row.imageUrl ?? "/product-placeholder.png",
    imageAlt: row.imageAlt ?? row.name,

    price,
    originalPrice: comparePrice,
    variantTitle: row.variantColor
      ? `${row.variantTitle} / ${row.variantColor}`
      : row.variantTitle,
    stock,

    shortDescription: row.shortDescription,

    badge: getProductCardBadge({
      isFeatured: row.isFeatured,
      createdAt: row.createdAt,
      stock,
      hasSale: Boolean(row.hasSale),
    }),

    /**
     * Important:
     * Shop list payload stays lightweight.
     * Full variants are fetched only when the add-to-cart modal/details need them.
     */
    variants: [],
  };
}

export async function getShopProducts({
  query,
  filters,
  sort,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
}: GetShopProductsArgs): Promise<{
  products: ShopProduct[];
  pagination: ShopPagination;
}> {
  const totalStartedAt = now();

  const safePage = Math.max(page, 1);
  const skip = (safePage - 1) * pageSize;
  const take = pageSize + 1;

  console.log("[shopService] shop products start", {
    query,
    sort,
    page: safePage,
    pageSize,
    skip,
    take,
    filters,
  });

  const rows = await timeAsync("shop products DB cards", () =>
    fetchProductCards({
      query,
      filters,
      sort,
      skip,
      take,
    })
  );

  const mapStartedAt = now();

  const hasNextPage = rows.length > pageSize;
  const visibleRows = rows.slice(0, pageSize);
  const products = visibleRows.map(mapProductCard);

  logTiming("shop products map cards", mapStartedAt);

  console.log("[shopService] shop products result", {
    returnedRows: rows.length,
    visibleProducts: products.length,
    hasPreviousPage: safePage > 1,
    hasNextPage,
  });

  logTiming("shop products total", totalStartedAt);

  return {
    products,
    pagination: {
      currentPage: safePage,
      pageSize,
      hasPreviousPage: safePage > 1,
      hasNextPage,
    },
  };
}

export async function getShopProductVariants(
  productId: string
): Promise<ShopProduct["variants"]> {
  const totalStartedAt = now();

  console.log("[shopService] product variants start", {
    productId,
  });

  const variants = await timeAsync("product variants DB", () =>
    prisma.productVariant.findMany({
      where: {
        productId,
        isActive: true,
        product: {
          isActive: true,
        },
      },
      select: {
        id: true,
        sku: true,
        title: true,
        color: true,
        price: true,
        comparePrice: true,
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

  const mapStartedAt = now();

  const mappedVariants = variants.map((variant: ProductVariantDbRecord) => ({
    id: variant.id,
    sku: variant.sku,
    title: variant.title,
    color: variant.color,
    price: Number(variant.price),
    comparePrice:
      variant.comparePrice === null ? null : Number(variant.comparePrice),
    stock: variant.stock,
  }));

  logTiming("product variants map", mapStartedAt);

  console.log("[shopService] product variants result", {
    productId,
    variants: mappedVariants.length,
  });

  logTiming("product variants total", totalStartedAt);

  return mappedVariants;
}