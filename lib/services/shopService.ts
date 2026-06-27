import "server-only";

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

function getProductBadge(product: {
  isFeatured: boolean;
  createdAt: Date;
  variants: {
    price: number;
    comparePrice: number | null;
    stock: number;
  }[];
}): ShopProduct["badge"] {
  const totalStock = product.variants.reduce(
    (sum, variant) => sum + variant.stock,
    0
  );

  if (totalStock <= 0) return "Out of Stock";

  const hasSaleVariant = product.variants.some(
    (variant) =>
      variant.comparePrice && variant.comparePrice > variant.price
  );

  if (hasSaleVariant) return "Sale";

  if (product.isFeatured) return "Featured";

  const daysOld =
    (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysOld <= 14) return "New";

  return undefined;
}

/*
export async function getShopFilterData(): Promise<{
  brands: BrandFilterOption[];
  priceBounds: [number, number];
}> {
  const [brands, priceAggregate] = await Promise.all([
    prisma.brand.findMany({
      where: {
        products: {
          some: {
            isActive: true,
            variants: {
              some: {
                isActive: true,
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: "asc",
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
  ]);

  const minPrice = Math.floor(
    priceAggregate._min.price ?? DEFAULT_PRICE_RANGE[0]
  );

  const maxPrice = Math.ceil(
    priceAggregate._max.price ?? DEFAULT_PRICE_RANGE[1]
  );

  return {
    brands: brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      count: brand._count.products,
    })),
    priceBounds: [minPrice, maxPrice],
  };
}

*/

export async function getShopFilterData(): Promise<{
  brands: BrandFilterOption[];
  categories: CategoryFilterOption[];
  priceBounds: [number, number];
}> {
  const [
    brands,
    brandCounts,
    categories,
    categoryCounts,
    priceAggregate,
  ] = await Promise.all([
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
  ]);

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
    priceAggregate._min.price ?? DEFAULT_PRICE_RANGE[0]
  );

  const maxPrice = Math.ceil(
    priceAggregate._max.price ?? DEFAULT_PRICE_RANGE[1]
  );

  return {
    brands: activeBrands,
    categories: activeCategories,
    priceBounds: [minPrice, maxPrice],
  };
}

interface GetShopProductsArgs {
  query: string;
  filters: FilterState;
  sort: SortOption;
  page: number;
  pageSize?: number;
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
  const variantWhere: Prisma.ProductVariantWhereInput = {
    isActive: true,
    price: {
      gte: filters.priceRange[0],
      lte: filters.priceRange[1],
    },
  };

  if (filters.onSale) {
    variantWhere.comparePrice = {
      not: null,
    };
  }

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    variants: {
      some: variantWhere,
    },
  };

  if (query) {
    where.OR = [
      {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        shortDescription: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        brand: {
          is: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
      {
        category: {
          is: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  if (filters.brands.length > 0) {
    where.brand = {
      is: {
        name: {
          in: filters.brands,
        },
      },
    };
  }

  if (filters.categories.length > 0) {
    where.category = {
      is: {
        name: {
          in: filters.categories,
        },
      },
    };
  }

  const productsFromDb = await prisma.product.findMany({
    where,
    include: {
      brand: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      images: {
        select: {
          url: true,
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
        where: variantWhere,
        select: {
          id: true,
          sku: true,
          title: true,
          color: true,
          price: true,
          comparePrice: true,
          stock: true,
        },
        orderBy: {
          price: "asc",
        },
      },
    },
    orderBy:
      sort === "newest"
        ? {
            createdAt: "desc",
          }
        : [
            {
              isFeatured: "desc",
            },
            {
              createdAt: "desc",
            },
          ],
  });

  let mappedProducts = productsFromDb
    .map((product) => {
      const firstAvailableVariant =
        product.variants.find((variant) => variant.stock > 0) ||
        product.variants[0];

      if (!firstAvailableVariant) return null;

      const mainImage =
        product.images.find((image) => image.type === "main") ??
        product.images[0];

      const totalStock = product.variants.reduce(
        (sum, variant) => sum + variant.stock,
        0
      );

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,

        brand: product.brand?.name ?? "Unbranded",
        category: product.category?.name ?? undefined,

        image: mainImage?.url ?? "/product-placeholder.png",
        imageAlt: mainImage?.alt ?? product.name,

        price: firstAvailableVariant.price,
        originalPrice: firstAvailableVariant.comparePrice,

        variantTitle: firstAvailableVariant.color
          ? `${firstAvailableVariant.title} / ${firstAvailableVariant.color}`
          : firstAvailableVariant.title,

        stock: totalStock,

        shortDescription: product.shortDescription,

        badge: getProductBadge(product),

        variants: product.variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          title: variant.title,
          color: variant.color,
          price: variant.price,
          comparePrice: variant.comparePrice,
          stock: variant.stock,
        })),
      };
    })
    .filter(Boolean) as ShopProduct[];

  if (sort === "price_asc") {
    mappedProducts = mappedProducts.sort((a, b) => a.price - b.price);
  }

  if (sort === "price_desc") {
    mappedProducts = mappedProducts.sort((a, b) => b.price - a.price);
  }

  const totalProducts = mappedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const start = (safePage - 1) * pageSize;
  const paginatedProducts = mappedProducts.slice(start, start + pageSize);

  return {
    products: paginatedProducts,
    pagination: {
      currentPage: safePage,
      pageSize,
      totalProducts,
      totalPages,
    },
  };
}