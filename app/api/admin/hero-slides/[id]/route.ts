import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

  sortOrder?: number | string;
  isActive?: boolean;
};

function cleanRequiredString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function cleanOptionalString(value: unknown) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function cleanSortOrder(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return numberValue;
}

// ======================
// GET SINGLE HERO SLIDE
// ======================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const slide = await prisma.heroSlide.findUnique({
      where: {
        id,
      },
    });

    if (!slide) {
      return Response.json(
        {
          success: false,
          message: "Hero slide not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      slide,
    });
  } catch (error) {
    console.error("GET_HERO_SLIDE_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load hero slide",
      },
      { status: 500 }
    );
  }
}

// ======================
// UPDATE HERO SLIDE
// ======================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as HeroSlidePayload;

    const title = cleanRequiredString(body.title);
    const imageDesktop = cleanRequiredString(body.imageDesktop);

    if (!title) {
      return Response.json(
        {
          success: false,
          message: "Title is required",
        },
        { status: 400 }
      );
    }

    if (!imageDesktop) {
      return Response.json(
        {
          success: false,
          message: "Desktop image is required",
        },
        { status: 400 }
      );
    }

    const existingSlide = await prisma.heroSlide.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingSlide) {
      return Response.json(
        {
          success: false,
          message: "Hero slide not found",
        },
        { status: 404 }
      );
    }

    const updatedSlide = await prisma.heroSlide.update({
      where: {
        id,
      },
      data: {
        title,
        subtitle: cleanOptionalString(body.subtitle),
        description: cleanOptionalString(body.description),

        imageDesktop,
        imageDesktopPublicId: cleanOptionalString(body.imageDesktopPublicId),

        imageMobile: cleanOptionalString(body.imageMobile),
        imageMobilePublicId: cleanOptionalString(body.imageMobilePublicId),

        buttonText: cleanRequiredString(body.buttonText) || "Shop Now",
        buttonLink: cleanRequiredString(body.buttonLink) || "/shop",

        sortOrder: cleanSortOrder(body.sortOrder),
        isActive:
          typeof body.isActive === "boolean" ? body.isActive : true,
      },
    });

    revalidatePath("/");

    return Response.json({
      success: true,
      message: "Hero slide updated successfully",
      slide: updatedSlide,
    });
  } catch (error) {
    console.error("UPDATE_HERO_SLIDE_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update hero slide",
      },
      { status: 500 }
    );
  }
}

// ======================
// DELETE HERO SLIDE
// ======================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingSlide = await prisma.heroSlide.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingSlide) {
      return Response.json(
        {
          success: false,
          message: "Hero slide not found",
        },
        { status: 404 }
      );
    }

    await prisma.heroSlide.delete({
      where: {
        id,
      },
    });

    revalidatePath("/");

    return Response.json({
      success: true,
      message: "Hero slide deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_HERO_SLIDE_ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete hero slide",
      },
      { status: 500 }
    );
  }
}