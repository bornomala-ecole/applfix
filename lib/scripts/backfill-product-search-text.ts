import { prisma } from "@/lib/prisma";
import { buildProductSearchText } from "@/lib/utils/productSearchText";

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      brand: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      series: {
        select: {
          name: true,
        },
      },
      variants: {
        select: {
          sku: true,
          title: true,
          color: true,
        },
      },
    },
  });

  console.log(`Found ${products.length} products to update`);

  for (const product of products) {
    const productSearchText = buildProductSearchText({
      name: product.name,
      brandName: product.brand?.name || null,
      categoryName: product.category?.name || null,
      seriesName: product.series?.name || null,
      variants: product.variants,
    });

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        productSearchText,
      },
    });
  }

  console.log("Backfill complete");
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });