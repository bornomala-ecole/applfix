import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please login to place an order" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const shippingFullName = String(body.shippingFullName || "").trim();
    const shippingPhone = String(body.shippingPhone || "").trim();
    const shippingAddress1 = String(body.shippingAddress1 || "").trim();
    const shippingAddress2 = String(body.shippingAddress2 || "").trim();
    const shippingCity = String(body.shippingCity || "").trim();
    const shippingState = String(body.shippingState || "").trim();
    const shippingPostcode = String(body.shippingPostcode || "").trim();
    const shippingCountry = String(body.shippingCountry || "").trim();
    const notes = String(body.notes || "").trim();

    const paymentMethod = body.paymentMethod || "cod";

    if (
      !shippingFullName ||
      !shippingPhone ||
      !shippingAddress1 ||
      !shippingCity ||
      !shippingCountry
    ) {
      return NextResponse.json(
        { message: "Please fill all required shipping fields" },
        { status: 400 }
      );
    }

    if (paymentMethod !== "cod") {
      return NextResponse.json(
        { message: "Only Cash on Delivery is available right now" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
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
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("Your cart is empty");
      }

      for (const item of cart.items) {
        if (!item.product.isActive) {
          throw new Error(`${item.product.name} is no longer available`);
        }

        if (!item.variant.isActive) {
          throw new Error(`${item.product.name} variant is no longer available`);
        }

        if (item.quantity > item.variant.stock) {
          throw new Error(
            `Only ${item.variant.stock} item(s) available for ${item.product.name}`
          );
        }
      }

      const subtotal = cart.items.reduce(
        (sum, item) => sum + item.variant.price * item.quantity,
        0
      );

      const shippingFee = 0;
      const tax = 0;
      const discount = 0;
      const total = subtotal + shippingFee + tax - discount;

      const createdOrder = await tx.order.create({
        data: {
          userId: session.user.id,

          subtotal,
          shippingFee,
          tax,
          discount,
          total,

          status: "pending",
          paymentMethod: "cod",
          paymentStatus: "unpaid",

          shippingFullName,
          shippingPhone,
          shippingAddress1,
          shippingAddress2: shippingAddress2 || null,
          shippingCity,
          shippingState: shippingState || null,
          shippingPostcode: shippingPostcode || null,
          shippingCountry,

          notes: notes || null,

          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,

              name: item.product.name,
              price: item.variant.price,
              quantity: item.quantity,

              sku: item.variant.sku,
              variantTitle: item.variant.title,
              color: item.variant.color,
              imageUrl: item.product.images?.[0]?.url || null,
            })),
          },
        },
      });

      for (const item of cart.items) {
        const updatedVariant = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedVariant.count === 0) {
          throw new Error(
            `Not enough stock available for ${item.product.name}`
          );
        }
      }

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return createdOrder;
    });

    return NextResponse.json({
      message: "Order placed successfully",
      orderId: order.id,
    });
  } catch (error) {
    console.error("CHECKOUT_ERROR", error);

    const message =
      error instanceof Error ? error.message : "Failed to place order";

    return NextResponse.json(
      {
        message,
      },
      { status: 500 }
    );
  }
}