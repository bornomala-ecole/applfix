import { prisma } from "@/lib/prisma"
import BrandClient from "./brand-client"

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <BrandClient brands={brands} />
}