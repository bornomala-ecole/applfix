import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { items: [], count: 0 },
        { status: 401 }
      );
    }

    const items = await prisma.wishlistItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: {
          include: {
            brand: true,
            images: {
              where: {
                type: "main",
              },
              take: 1,
            },
            variants: {
              where: {
                isActive: true,
              },
              orderBy: {
                price: "asc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("GET_WISHLIST_ERROR", error);

    return NextResponse.json(
      { message: "Failed to load wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please login to use wishlist" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const productId = String(body.productId || "");

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: {
          id: existing.id,
        },
      });

      return NextResponse.json({
        message: "Removed from wishlist",
        wishlisted: false,
      });
    }

    await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({
      message: "Added to wishlist",
      wishlisted: true,
    });
  } catch (error) {
    console.error("TOGGLE_WISHLIST_ERROR", error);

    return NextResponse.json(
      { message: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}