import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  console.log("✅ WEBHOOK GET TEST HIT");
  return NextResponse.json({ message: "Webhook route exists" });
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

