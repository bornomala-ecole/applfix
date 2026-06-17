import { prisma } from "@/lib/prisma"
import EditProductClient from "./product-edit-client"

type Props = {
  params: Promise<{ id: string }>;
};



export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: id },
    include: {
      images: true,
      variants: true,
    },
  })

  const [brands, categories] = await Promise.all([
    prisma.brand.findMany(),
    prisma.category.findMany(),
  ])

  return (
    <EditProductClient
      product={product}
      brands={brands}
      categories={categories}
    />
  )
}