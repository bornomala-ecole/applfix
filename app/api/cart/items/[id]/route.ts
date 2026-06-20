import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const quantity = Number(body.quantity || 1);

    if (quantity < 1) {
      return NextResponse.json(
        { message: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: {
          userId: session.user.id,
        },
      },
      include: {
        variant: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { message: "Cart item not found" },
        { status: 404 }
      );
    }

    if (quantity > cartItem.variant.stock) {
      return NextResponse.json(
        { message: `Only ${cartItem.variant.stock} item(s) available` },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
    });

    return NextResponse.json({
      message: "Cart updated",
      item: updatedItem,
    });
  } catch (error) {
    console.error("UPDATE_CART_ITEM_ERROR", error);

    return NextResponse.json(
      { message: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        cart: {
          userId: session.user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { message: "Cart item not found" },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("DELETE_CART_ITEM_ERROR", error);

    return NextResponse.json(
      { message: "Failed to remove cart item" },
      { status: 500 }
    );
  }
}