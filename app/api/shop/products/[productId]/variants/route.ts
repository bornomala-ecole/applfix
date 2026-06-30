import { NextRequest, NextResponse } from "next/server";
import { getShopProductVariants } from "@/lib/services/shopService";

export const dynamic = "force-dynamic";

type RouteContext = {
  params:
    | {
        productId: string;
      }
    | Promise<{
        productId: string;
      }>;
};

function logTiming(label: string, startedAt: number) {
  console.log(`[shop variants API] ${label}: ${(performance.now() - startedAt).toFixed(2)}ms`);
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const totalStartedAt = performance.now();

  try {
    const { productId } = await context.params;

    if (!productId) {
      return NextResponse.json(
        {
          message: "Product ID is required",
        },
        {
          status: 400,
        }
      );
    }

    console.log("[shop variants API] request start", {
      productId,
    });

    const dbStartedAt = performance.now();

    const variants = await getShopProductVariants(productId);

    logTiming("service + DB", dbStartedAt);

    console.log("[shop variants API] request result", {
      productId,
      variants: variants.length,
    });

    logTiming("total", totalStartedAt);

    return NextResponse.json({
      productId,
      variants,
    });
  } catch (error) {
    console.error("[shop variants API] failed", error);

    logTiming("failed total", totalStartedAt);

    return NextResponse.json(
      {
        message: "Failed to fetch product variants",
      },
      {
        status: 500,
      }
    );
  }
}