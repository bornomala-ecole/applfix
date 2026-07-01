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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const currentCategory = await prisma.category.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!currentCategory) {
      return Response.json(
        { message: "Category not found" },
        { status: 404 }
      )
    }

    const conflictingCategory = await prisma.category.findFirst({
      where: {
        id: {
          not: id,
        },
        OR: [
          { name },
          { slug },
        ],
      },
      select: {
        id: true,
      },
    })

    if (conflictingCategory) {
      return Response.json(
        { message: "Another category with this name or slug already exists" },
        { status: 409 }
      )
    }

    const category = await prisma.category.update({
      where: { id },
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

    return Response.json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      sortOrder: category.sortOrder,
      productCount: category._count.products,
    })
  } catch (error) {
    console.error("[PATCH /api/admin/categories/[id]] failed", error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { message: "Another category with this name or slug already exists" },
        { status: 409 }
      )
    }

    return Response.json(
      { message: "Failed to update category" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!category) {
      return Response.json(
        { message: "Category not found" },
        { status: 404 }
      )
    }

    if (category._count.products > 0) {
      return Response.json(
        {
          message:
            "This category has products assigned to it. Reassign or remove those products before deleting.",
        },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/admin/categories/[id]] failed", error)

    return Response.json(
      { message: "Failed to delete category" },
      { status: 500 }
    )
  }
}