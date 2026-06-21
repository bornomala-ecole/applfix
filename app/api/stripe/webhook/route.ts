import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  console.log("✅ WEBHOOK GET TEST HIT");
  return NextResponse.json({ message: "Webhook route exists" });
}

export async function PST(req: NextRequest) {
  console.log("✅ STRIPE WEBHOOK ROUTE HIT");

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    console.log("❌ Missing stripe-signature");
    return NextResponse.json({ message: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.log("❌ Stripe signature failed", error);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  console.log("✅ Stripe event:", event.type);

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    console.log("✅ Checkout session:", checkoutSession.id);
    console.log("✅ Payment status:", checkoutSession.payment_status);
    console.log("✅ Metadata:", checkoutSession.metadata);
    console.log("✅ Payment intent:", checkoutSession.payment_intent);

    const orderId = checkoutSession.metadata?.orderId;

    if (!orderId) {
      console.log("❌ No orderId in metadata");
      return NextResponse.json({ received: true });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "processing",
        paymentStatus: "paid",
        stripeCheckoutSessionId: checkoutSession.id,
        stripePaymentIntentId:
          typeof checkoutSession.payment_intent === "string"
            ? checkoutSession.payment_intent
            : null,
      },
    });



    console.log("✅ Order marked as paid:", orderId);
  }

  return NextResponse.json({ received: true });
}


export async function POST(req: NextRequest) {
  console.log("✅ STRIPE WEBHOOK ROUTE HIT");

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    console.log("❌ Missing stripe-signature");
    return NextResponse.json({ message: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.log("❌ Stripe signature failed", error);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  console.log("✅ Stripe event:", event.type);

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    console.log("✅ Checkout session:", checkoutSession.id);
    console.log("✅ Payment status:", checkoutSession.payment_status);
    console.log("✅ Metadata:", checkoutSession.metadata);
    console.log("✅ Payment intent:", checkoutSession.payment_intent);

    if (checkoutSession.payment_status !== "paid") {
      console.log("⚠️ Checkout completed but payment is not paid");
      return NextResponse.json({ received: true });
    }

    const orderId = checkoutSession.metadata?.orderId;

    if (!orderId) {
      console.log("❌ No orderId in metadata");
      return NextResponse.json({ received: true });
    }

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        console.log("❌ Order not found:", orderId);
        throw new Error("Order not found");
      }

      if (order.paymentStatus === "paid") {
        console.log("⚠️ Order already paid:", order.id);
        return;
      }

      for (const item of order.items) {
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
          throw new Error(`Not enough stock available for ${item.name}`);
        }
      }

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "processing",
          paymentStatus: "paid",
          stripeCheckoutSessionId: checkoutSession.id,
          stripePaymentIntentId:
            typeof checkoutSession.payment_intent === "string"
              ? checkoutSession.payment_intent
              : null,
        },
      });

      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId: order.userId,
          },
        },
      });

      console.log("✅ Order marked as paid:", order.id);
      console.log("✅ Cart cleared for user:", order.userId);
    });
  }

  return NextResponse.json({ received: true });
}
