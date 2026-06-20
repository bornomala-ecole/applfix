import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized", items: [], count: 0, subtotal: 0 },
        { status: 401 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: {
                    type: "main",
                  },
                  take: 1,
                },
              },
            },
            variant: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const items = cart?.items || [];

    const subtotal = items.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );

    const count = items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return NextResponse.json({
      items,
      count,
      subtotal,
    });
  } catch (error) {
    console.error("GET_CART_ERROR", error);

    return NextResponse.json(
      { message: "Failed to load cart" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please login to add products to cart" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const productId = String(body.productId || "");
    const variantId = String(body.variantId || "");
    const quantity = Math.max(Number(body.quantity || 1), 1);

    if (!productId || !variantId) {
      return NextResponse.json(
        { message: "Product and variant are required" },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId,
        isActive: true,
        product: {
          isActive: true,
        },
      },
      select: {
        id: true,
        stock: true,
      },
    });

    if (!variant) {
      return NextResponse.json(
        { message: "Product variant not found" },
        { status: 404 }
      );
    }

    if (variant.stock <= 0) {
      return NextResponse.json(
        { message: "This product is out of stock" },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.upsert({
      where: {
        userId: session.user.id,
      },
      update: {},
      create: {
        userId: session.user.id,
      },
    });

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (newQuantity > variant.stock) {
      return NextResponse.json(
        { message: `Only ${variant.stock} item(s) available in stock` },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId: cart.id,
        productId,
        variantId,
        quantity,
      },
    });

    return NextResponse.json({
      message: "Product added to cart",
      cartItem,
    });
  } catch (error) {
    console.error("ADD_TO_CART_ERROR", error);

    return NextResponse.json(
      { message: "Failed to add product to cart" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!cart) {
      return NextResponse.json({
        message: "Cart already empty",
      });
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return NextResponse.json({
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("CLEAR_CART_ERROR", error);

    return NextResponse.json(
      { message: "Failed to clear cart" },
      { status: 500 }
    );
  }
}