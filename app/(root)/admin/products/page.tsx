import { prisma } from "@/lib/prisma"
import ProductsClient from "./products-client"

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return <ProductsClient products={products} />
}