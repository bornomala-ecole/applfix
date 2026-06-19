import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AddressType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
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

    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: {
            userId: session.user.id,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.address.create({
        data: {
          userId: session.user.id,
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

    return NextResponse.json(
      {
        message: "Address created successfully",
        address,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_ADDRESS_ERROR", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}