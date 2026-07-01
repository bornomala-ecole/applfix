import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function parseSortOrder(value: unknown) {
  const numberValue = Number(value ?? 0)

  if (!Number.isFinite(numberValue)) {
    return 0
  }

  return Math.trunc(numberValue)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const name = String(body.name || "").trim()

    if (!name) {
      return Response.json(
        { message: "Category name is required" },
        { status: 400 }
      )
    }

    const slug = slugify(String(body.slug || name))
    const image = String(body.image || "").trim() || null
    const sortOrder = parseSortOrder(body.sortOrder)

    if (!slug) {
      return Response.json(
        { message: "Category slug is required" },
        { status: 400 }
      )
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name },
          { slug },
        ],
      },
      select: {
        id: true,
      },
    })

    if (existingCategory) {
      return Response.json(
        { message: "A category with this name or slug already exists" },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        image,
        sortOrder,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        sortOrder: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    return Response.json(
      {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image,
        sortOrder: category.sortOrder,
        productCount: category._count.products,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/admin/categories] failed", error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { message: "A category with this name or slug already exists" },
        { status: 409 }
      )
    }

    return Response.json(
      { message: "Failed to create category" },
      { status: 500 }
    )
  }
}