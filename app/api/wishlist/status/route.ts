import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function logTiming(label: string, startedAt: number) {
  console.log(
    `[wishlist status API] ${label}: ${(performance.now() - startedAt).toFixed(2)}ms`
  );
}

export async function GET(request: NextRequest) {
  const totalStartedAt = performance.now();

  try {
    const productId = request.nextUrl.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        {
          message: "Product ID is required",
          wishlisted: false,
        },
        {
          status: 400,
        }
      );
    }

    const authStartedAt = performance.now();
    const session = await auth();
    logTiming("auth", authStartedAt);

    if (!session?.user?.id) {
      logTiming("total unauthenticated", totalStartedAt);

      return NextResponse.json({
        wishlisted: false,
      });
    }

    const dbStartedAt = performance.now();

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      select: {
        id: true,
      },
    });

    logTiming("wishlist DB", dbStartedAt);

    const wishlisted = Boolean(wishlistItem);

    console.log("[wishlist status API] result", {
      productId,
      wishlisted,
    });

    logTiming("total", totalStartedAt);

    return NextResponse.json({
      wishlisted,
    });
  } catch (error) {
    console.error("[wishlist status API] failed", error);

    logTiming("failed total", totalStartedAt);

    return NextResponse.json(
      {
        message: "Failed to fetch wishlist status",
        wishlisted: false,
      },
      {
        status: 500,
      }
    );
  }
}