import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const allowedOrderStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const allowedPaymentStatuses = [
  "unpaid",
  "paid",
  "failed",
  "refunded",
];

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = session.user.role;

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const status = body.status ? String(body.status).toLowerCase() : undefined;
    const paymentStatus = body.paymentStatus
      ? String(body.paymentStatus).toLowerCase()
      : undefined;

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { message: "No status value provided" },
        { status: 400 }
      );
    }

    if (status && !allowedOrderStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid order status" },
        { status: 400 }
      );
    }

    if (
      paymentStatus &&
      !allowedPaymentStatuses.includes(paymentStatus)
    ) {
      return NextResponse.json(
        { message: "Invalid payment status" },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("ADMIN_ORDER_STATUS_UPDATE_ERROR", error);

    return NextResponse.json(
      { message: "Failed to update order status" },
      { status: 500 }
    );
  }
}