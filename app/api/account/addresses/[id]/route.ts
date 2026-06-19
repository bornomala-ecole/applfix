import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AddressType } from "@prisma/client";

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

    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const type = body.type as AddressType;
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const addressLine1 = String(body.addressLine1 || "").trim();
    const addressLine2 = String(body.addressLine2 || "").trim();
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const postalCode = String(body.postalCode || "").trim();
    const country = String(body.country || "").trim();
    const isDefault = Boolean(body.isDefault);

    const validTypes = Object.values(AddressType);

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { message: "Invalid address type" },
        { status: 400 }
      );
    }

    if (!addressLine1 || !city || !country) {
      return NextResponse.json(
        {
          message:
            "Address line 1, city, and country are required",
        },
        { status: 400 }
      );
    }

    if (phone.length > 30) {
      return NextResponse.json(
        { message: "Phone number is too long" },
        { status: 400 }
      );
    }

    const updatedAddress = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: {
            userId: session.user.id,
            NOT: {
              id,
            },
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.address.update({
        where: {
          id,
        },
        data: {
          type,
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
          isDefault,
        },
        select: {
          id: true,
          type: true,
          fullName: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    return NextResponse.json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("UPDATE_ADDRESS_ERROR", error);

    return NextResponse.json(
      { message: "Something went wrong" },
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

    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    await prisma.address.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_ADDRESS_ERROR", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}