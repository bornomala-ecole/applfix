import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type HeroSlidePayload = {
  title?: string;
  subtitle?: string | null;
  description?: string | null;

  imageDesktop?: string;
  imageDesktopPublicId?: string | null;

  imageMobile?: string | null;
  imageMobilePublicId?: string | null;

  buttonText?: string;
  buttonLink?: string;

  sortOrder?: number;
  isActive?: boolean;
};

function cleanOptionalString(value: unknown) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  return trimmed.length ? trimmed : null;
}

function cleanRequiredString(value: unknown) {
  if (typeof value !== "string") return "";

  return value.trim();
}

export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      slides,
    });
  } catch (error) {
    console.error("GET_ADMIN_HERO_SLIDES_ERROR", error);

    return NextResponse.json(
      {
        message: "Failed to load hero slides",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HeroSlidePayload;

    const title = cleanRequiredString(body.title);
    const imageDesktop = cleanRequiredString(body.imageDesktop);

    if (!title) {
      return NextResponse.json(
        {
          message: "Title is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!imageDesktop) {
      return NextResponse.json(
        {
          message: "Desktop image is required",
        },
        {
          status: 400,
        }
      );
    }

    const buttonText = cleanRequiredString(body.buttonText) || "Shop Now";
    const buttonLink = cleanRequiredString(body.buttonLink) || "/shop";

    const slide = await prisma.heroSlide.create({
      data: {
        title,
        subtitle: cleanOptionalString(body.subtitle),
        description: cleanOptionalString(body.description),

        imageDesktop,
        imageDesktopPublicId: cleanOptionalString(body.imageDesktopPublicId),

        imageMobile: cleanOptionalString(body.imageMobile),
        imageMobilePublicId: cleanOptionalString(body.imageMobilePublicId),

        buttonText,
        buttonLink,

        sortOrder:
          typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)
            ? body.sortOrder
            : 0,

        isActive:
          typeof body.isActive === "boolean" ? body.isActive : true,
      },
    });

    return NextResponse.json(
      {
        message: "Hero slide created successfully",
        slide,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("CREATE_ADMIN_HERO_SLIDE_ERROR", error);

    return NextResponse.json(
      {
        message: "Failed to create hero slide",
      },
      {
        status: 500,
      }
    );
  }
}