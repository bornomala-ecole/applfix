import { prisma } from "@/lib/prisma"
import slugify from "slugify"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const name = body.name?.trim()
    const logo = body.logo || null
    const sortOrder = Number(body.sortOrder || 0)

    if (!name) {
      return Response.json(
        { message: "Brand name is required" },
        { status: 400 }
      )
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
    })

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        slug,
        logo,
        sortOrder,
      },
    })

    return Response.json(brand)
  } catch (error: any) {
    if (error?.code === "P2002") {
      return Response.json(
        { message: "Brand name or slug already exists" },
        { status: 409 }
      )
    }

    return Response.json(
      { message: "Failed to update brand" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.brand.delete({
      where: { id },
    })

    return Response.json({ success: true })
  } catch {
    return Response.json(
      { message: "Failed to delete brand" },
      { status: 500 }
    )
  }
}