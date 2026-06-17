import { prisma } from "@/lib/prisma"

export async function GET() {
  const brands = await prisma.brand.findMany()
  const categories = await prisma.category.findMany()

  return Response.json({ brands, categories })
}