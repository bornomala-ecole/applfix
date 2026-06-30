import { NextRequest, NextResponse } from "next/server";
import {
  getShopProducts,
  parseShopPage,
  parseShopQuery,
  parseShopSort,
  ShopSearchParams,
} from "@/lib/services/shopService";
import { FilterState } from "@/lib/types/shop";

export const dynamic = "force-dynamic";

const API_PRICE_RANGE: [number, number] = [0, 999999999];

function logTiming(label: string, startedAt: number) {
  console.log(
    `[shop products API] ${label}: ${(performance.now() - startedAt).toFixed(2)}ms`
  );
}

function getSearchParamValue(
  searchParams: URLSearchParams,
  key: string
): string | string[] | undefined {
  const values = searchParams.getAll(key);

  if (values.length === 0) return undefined;
  if (values.length === 1) return values[0];

  return values;
}

function toNumber(value: string | null, fallback: number) {
  if (!value) return fallback;

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function parseApiFilters(searchParams: URLSearchParams): FilterState {
  const minPrice = toNumber(searchParams.get("min_price"), API_PRICE_RANGE[0]);
  const maxPrice = toNumber(searchParams.get("max_price"), API_PRICE_RANGE[1]);

  return {
    brands: searchParams.getAll("brand"),
    categories: searchParams.getAll("category"),
    priceRange: [
      Math.max(API_PRICE_RANGE[0], minPrice),
      Math.max(minPrice, maxPrice),
    ],
    onSale: searchParams.get("on_sale") === "true",
  };
}

export async function GET(request: NextRequest) {
  const totalStartedAt = performance.now();

  try {
    const parseStartedAt = performance.now();

    const { searchParams } = request.nextUrl;

    const shopSearchParams: ShopSearchParams = {
      q: getSearchParamValue(searchParams, "q"),
      sort: getSearchParamValue(searchParams, "sort"),
      page: getSearchParamValue(searchParams, "page"),
    };

    const query = parseShopQuery(shopSearchParams);
    const filters = parseApiFilters(searchParams);
    const sort = parseShopSort(shopSearchParams.sort);
    const page = parseShopPage(shopSearchParams.page);

    logTiming("parse params", parseStartedAt);

    console.log("[shop products API] request start", {
      query,
      filters,
      sort,
      page,
      pageSize: 12,
    });

    const serviceStartedAt = performance.now();

    const { products, pagination } = await getShopProducts({
      query,
      filters,
      sort,
      page,
      pageSize: 12,
    });

    logTiming("service", serviceStartedAt);

    console.log("[shop products API] request result", {
      products: products.length,
      pagination,
    });

    logTiming("total", totalStartedAt);

    return NextResponse.json({
      products,
      pagination,
      query,
      filters,
      sort,
    });
  } catch (error) {
    console.error("[shop products API] failed:", error);

    logTiming("failed total", totalStartedAt);

    return NextResponse.json(
      {
        message: "Failed to fetch shop products",
      },
      {
        status: 500,
      }
    );
  }
}